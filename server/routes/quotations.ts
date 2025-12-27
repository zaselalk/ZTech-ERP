import express, { Request, Response } from "express";
import { Op } from "sequelize";
const db = require("../db/models");
const {
  sequelize,
  Quotation,
  QuotationItem,
  Product,
  Customer,
  Sale,
  SaleItem,
} = db;

const router = express.Router();

interface QuotationItemRequest {
  ProductId: number;
  quantity: number;
  discount?: number;
  discount_type?: "Fixed" | "Percentage";
}

interface CartDiscount {
  type: "Fixed" | "Percentage";
  value: number;
}

interface CreateQuotationRequestBody {
  CustomerId: number;
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
        "customer",
        { model: QuotationItem, as: "items", include: ["product"] },
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
    const { CustomerId, items, cartDiscount, expiresAt } = req.body;

    if (!CustomerId || !items || items.length === 0 || !expiresAt) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const t = await sequelize.transaction();
    let subtotalAfterItemDiscounts = 0;

    try {
      const quotation = await Quotation.create(
        {
          CustomerId,
          total_amount: 0,
          discount: 0,
          expiresAt: new Date(expiresAt),
          status: "Active",
        },
        { transaction: t }
      );

      for (const item of items) {
        const product = await Product.findByPk(item.ProductId, {
          transaction: t,
        });

        if (!product)
          throw new Error(`Product with id ${item.ProductId} not found`);
        // Note: We do NOT check stock or deduct it for quotations

        let itemPrice = parseFloat(product.price);
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
            ProductId: item.ProductId,
            quantity: item.quantity,
            price: product.price,
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
          "customer",
          { model: QuotationItem, as: "items", include: ["product"] },
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
    const { payment_method } = req.body;

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
          CustomerId: quotation.CustomerId,
          payment_method,
          total_amount: quotation.total_amount,
          discount: quotation.discount,
        },
        { transaction: t }
      );

      // Process items
      for (const qItem of quotation.items) {
        const product = await Product.findByPk(qItem.ProductId, {
          transaction: t,
        });

        if (!product)
          throw new Error(`Product with id ${qItem.ProductId} not found`);
        if (product.quantity < qItem.quantity)
          throw new Error(`Not enough stock for product: ${product.name}`);

        // Create SaleItem
        await SaleItem.create(
          {
            SaleId: sale.id,
            ProductId: qItem.ProductId,
            quantity: qItem.quantity,
            price: qItem.price,
            discount: qItem.discount,
            discount_type: qItem.discount_type,
            productName: product.name,
            productBrand: product.brand,
            productBarcode: product.barcode,
          },
          { transaction: t }
        );

        // Decrement stock
        await product.decrement("quantity", {
          by: qItem.quantity,
          transaction: t,
        });
      }

      // Update Consignment if needed
      if (payment_method === "Consignment") {
        const customer = await Customer.findByPk(quotation.CustomerId, {
          transaction: t,
        });
        if (customer) {
          await customer.increment("credit_balance", {
            by: quotation.total_amount,
            transaction: t,
          });
        }
      }

      // Update Quotation status
      await quotation.update({ status: "Converted" }, { transaction: t });

      await t.commit();

      const finalSale = await Sale.findByPk(sale.id, {
        include: ["customer", { model: Product, as: "products" }],
      });

      res.status(201).json(finalSale);
    } catch (err) {
      await t.rollback();
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete quotation
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const quotation = await Quotation.findByPk(req.params.id);
    if (!quotation) {
      res.status(404).json({ message: "Quotation not found" });
      return;
    }
    await quotation.destroy();
    res.status(204).send();
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

export default router;
