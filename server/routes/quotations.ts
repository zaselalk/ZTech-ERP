import express, { Request, Response } from "express";
import { Op } from "sequelize";
const db = require("../db/models");
const { sequelize, Quotation, QuotationItem, Book, Bookshop, Sale, SaleItem } =
  db;

const router = express.Router();

interface QuotationItemRequest {
  BookId: number;
  quantity: number;
  discount?: number;
  discount_type?: "Fixed" | "Percentage";
}

interface CartDiscount {
  type: "Fixed" | "Percentage";
  value: number;
}

interface CreateQuotationRequestBody {
  BookshopId: number;
  items: QuotationItemRequest[];
  cartDiscount?: CartDiscount;
  expiresAt: string;
}

// Get all quotations
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    const quotations = await Quotation.findAll({
      where: whereClause,
      include: [
        "bookshop",
        { model: QuotationItem, as: "items", include: ["book"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(quotations);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Create a new quotation
router.post(
  "/",
  async (
    req: Request<{}, {}, CreateQuotationRequestBody>,
    res: Response
  ): Promise<void> => {
    const { BookshopId, items, cartDiscount, expiresAt } = req.body;

    if (!BookshopId || !items || items.length === 0 || !expiresAt) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const t = await sequelize.transaction();
    let subtotalAfterItemDiscounts = 0;

    try {
      const quotation = await Quotation.create(
        {
          BookshopId,
          total_amount: 0,
          discount: 0,
          expiresAt: new Date(expiresAt),
          status: "Active",
        },
        { transaction: t }
      );

      for (const item of items) {
        const book = await Book.findByPk(item.BookId, { transaction: t });

        if (!book) throw new Error(`Book with id ${item.BookId} not found`);
        // Note: We do NOT check stock or deduct it for quotations

        let itemPrice = parseFloat(book.price);
        let itemDiscountValue = parseFloat(String(item.discount || 0));

        if (item.discount_type === "Fixed" && itemDiscountValue > 0) {
          itemPrice -= itemDiscountValue;
        } else if (
          item.discount_type === "Percentage" &&
          itemDiscountValue > 0
        ) {
          itemPrice *= 1 - itemDiscountValue / 100;
        }
        itemPrice = Math.max(0, itemPrice);

        subtotalAfterItemDiscounts += itemPrice * item.quantity;

        await QuotationItem.create(
          {
            QuotationId: quotation.id,
            BookId: item.BookId,
            quantity: item.quantity,
            price: book.price,
            discount: itemDiscountValue,
            discount_type: item.discount_type || "Fixed",
          },
          { transaction: t }
        );
      }

      let finalCartDiscountAmount = 0;
      if (cartDiscount) {
        if (cartDiscount.type === "Fixed") {
          finalCartDiscountAmount = parseFloat(String(cartDiscount.value));
        } else if (cartDiscount.type === "Percentage") {
          finalCartDiscountAmount =
            subtotalAfterItemDiscounts *
            (parseFloat(String(cartDiscount.value)) / 100);
        }
      }

      const finalTotalAmount = Math.max(
        0,
        subtotalAfterItemDiscounts - finalCartDiscountAmount
      );

      await quotation.update(
        {
          total_amount: finalTotalAmount,
          discount: finalCartDiscountAmount,
        },
        { transaction: t }
      );

      await t.commit();

      const finalQuotation = await Quotation.findByPk(quotation.id, {
        include: [
          "bookshop",
          { model: QuotationItem, as: "items", include: ["book"] },
        ],
      });

      res.status(201).json(finalQuotation);
    } catch (err) {
      await t.rollback();
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Convert quotation to sale
router.post(
  "/:id/convert",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { payment_method } = req.body; // We need payment method for the sale

    if (!payment_method) {
      res.status(400).json({ message: "Payment method is required" });
      return;
    }

    const t = await sequelize.transaction();

    try {
      const quotation = await Quotation.findByPk(id, {
        include: [{ model: QuotationItem, as: "items" }],
        transaction: t,
      });

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      if (quotation.status !== "Active") {
        throw new Error("Quotation is not active");
      }

      // Create Sale
      const sale = await Sale.create(
        {
          BookshopId: quotation.BookshopId,
          payment_method,
          total_amount: quotation.total_amount,
          discount: quotation.discount,
        },
        { transaction: t }
      );

      // Process items
      for (const qItem of quotation.items) {
        const book = await Book.findByPk(qItem.BookId, { transaction: t });

        if (!book) throw new Error(`Book with id ${qItem.BookId} not found`);
        if (book.quantity < qItem.quantity)
          throw new Error(`Not enough stock for book: ${book.name}`);

        // Create SaleItem
        await SaleItem.create(
          {
            SaleId: sale.id,
            BookId: qItem.BookId,
            quantity: qItem.quantity,
            price: qItem.price,
            discount: qItem.discount,
            discount_type: qItem.discount_type,
          },
          { transaction: t }
        );

        // Decrement stock
        await book.decrement("quantity", {
          by: qItem.quantity,
          transaction: t,
        });
      }

      // Update Consignment if needed
      if (payment_method === "Consignment") {
        const bookshop = await Bookshop.findByPk(quotation.BookshopId, {
          transaction: t,
        });
        if (bookshop) {
          await bookshop.increment("consignment", {
            by: quotation.total_amount,
            transaction: t,
          });
        }
      }

      // Update Quotation status
      await quotation.update({ status: "Converted" }, { transaction: t });

      await t.commit();

      const finalSale = await Sale.findByPk(sale.id, {
        include: ["bookshop", { model: Book, as: "books" }],
      });

      res.status(201).json(finalSale);
    } catch (err) {
      await t.rollback();
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;
