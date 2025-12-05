import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import { col, fn, literal, Op } from "sequelize";
const db = require("../db/models");
const { sequelize, Sale, SaleItem, Book, Bookshop } = db;

const router = express.Router();

interface SaleItem {
  BookId: number;
  quantity: number;
  discount?: number;
  discount_type?: "Fixed" | "Percentage";
}

interface CartDiscount {
  type: "Fixed" | "Percentage";
  value: number;
}

interface CreateSaleRequestBody {
  BookshopId: number;
  payment_method: "Cash" | "Card" | "Consignment";
  items: SaleItem[];
  cartDiscount?: CartDiscount;
}

interface EmailRequestBody {
  email: string;
}

// Get all sales
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause: any = {};

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        [Op.between]: [start, end],
      };
    }

    const sales = await Sale.findAll({
      where: whereClause,
      include: ["bookshop", { model: Book, as: "books" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(sales);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get daily sales
router.get(
  "/daily-sales-trend",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const whereClause: any = {};

      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);

        whereClause.createdAt = {
          [Op.between]: [start, end],
        };
      }

      // otherwise set last month as default
      whereClause.createdAt = whereClause.createdAt || {
        [Op.between]: [
          new Date(new Date().setDate(new Date().getDate() - 30)),
          new Date(),
        ],
      };

      const sales = await Sale.findAll({
        where: whereClause,
        group: [literal("DATE(createdAt)")],
        attributes: [
          [literal("DATE(createdAt)"), "date"],
          [fn("SUM", col("total_amount")), "totalSales"],
        ],
        order: [[literal("DATE(createdAt)"), "ASC"]],
      });

      res.send(sales);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error);
    }
  }
);

// get sales payment method
router.get(
  "/sales-payment",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const whereClause: any = {};

      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);

        whereClause.createdAt = {
          [Op.between]: [start, end],
        };
      }

      // otherwise set last month as default
      whereClause.createdAt = whereClause.createdAt || {
        [Op.between]: [
          new Date(new Date().setDate(new Date().getDate() - 30)),
          new Date(),
        ],
      };

      const sales = await Sale.findAll({
        where: whereClause,
        group: [literal("payment_method")],
        attributes: [
          [fn("SUM", col("total_amount")), "totalSales"],
          [literal("payment_method"), "payment_method"],
        ],
      });

      res.send(sales);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error);
    }
  }
);

// Get a single sale
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: ["bookshop", { model: Book, as: "books" }],
    });
    if (sale) {
      res.json(sale);
    } else {
      res.status(404).json({ message: "Sale not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Create a new sale
router.post(
  "/",
  async (
    req: Request<{}, {}, CreateSaleRequestBody>,
    res: Response
  ): Promise<void> => {
    // cartDiscount is the overall discount object { type, value }
    const { BookshopId, payment_method, items, cartDiscount } = req.body;

    if (!BookshopId || !payment_method || !items || items.length === 0) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const t = await sequelize.transaction();
    let subtotalAfterItemDiscounts = 0;

    try {
      // Create the main Sale record first. The final total will be updated later.
      const sale = await Sale.create(
        { BookshopId, payment_method, total_amount: 0, discount: 0 },
        { transaction: t }
      );

      for (const item of items) {
        const book = await Book.findByPk(item.BookId, { transaction: t });

        if (!book) throw new Error(`Book with id ${item.BookId} not found`);
        if (book.quantity < item.quantity)
          throw new Error(`Not enough stock for book: ${book.name}`);

        let itemPrice = parseFloat(book.price);
        let itemDiscountValue = parseFloat(String(item.discount || 0));

        // Apply item-level discount
        if (item.discount_type === "Fixed" && itemDiscountValue > 0) {
          itemPrice -= itemDiscountValue;
        } else if (
          item.discount_type === "Percentage" &&
          itemDiscountValue > 0
        ) {
          itemPrice *= 1 - itemDiscountValue / 100;
        }
        itemPrice = Math.max(0, itemPrice); // Ensure price doesn't go below zero

        subtotalAfterItemDiscounts += itemPrice * item.quantity;

        // Create the SaleItem with discount details
        await SaleItem.create(
          {
            SaleId: sale.id,
            BookId: item.BookId,
            quantity: item.quantity,
            price: book.price, // Store original price
            discount: itemDiscountValue,
            discount_type: item.discount_type || "Fixed",
          },
          { transaction: t }
        );

        // Decrement stock
        await book.decrement("quantity", { by: item.quantity, transaction: t });
      }

      // Calculate and apply the overall cart discount
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

      // Update the sale with the final calculated amounts
      await sale.update(
        {
          total_amount: finalTotalAmount,
          discount: finalCartDiscountAmount, // Store the calculated cart discount amount
        },
        { transaction: t }
      );

      if (payment_method === "Consignment") {
        const bookshop = await Bookshop.findByPk(BookshopId, {
          transaction: t,
        });
        if (bookshop) {
          await bookshop.increment("consignment", {
            by: finalTotalAmount,
            transaction: t,
          });
        }
      }

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

// TODO: Configure transporter in a separate config file and use environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send receipt email
router.post(
  "/:id/email",
  async (
    req: Request<{ id: string }, {}, EmailRequestBody>,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const sale = await Sale.findByPk(req.params.id, {
        include: ["bookshop", { model: Book, as: "books" }],
      });

      if (!sale) {
        res.status(404).json({ message: "Sale not found" });
        return;
      }

      // Generate HTML for the receipt
      const subtotal = sale.books.reduce(
        (acc: number, book: any) =>
          acc + book.SaleItem.price * book.SaleItem.quantity,
        0
      );

      const receiptHtml = `
      <h1>Receipt - Sale #${sale.id}</h1>
      ${
        sale.bookshop
          ? `<p><strong>Bookshop:</strong> ${sale.bookshop.name}</p>`
          : ""
      }
      <p><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleString()}</p>
      <p><strong>Payment Method:</strong> ${sale.payment_method}</p>
      <hr />
      <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${sale.books
            .map(
              (book: any) => `
            <tr>
              <td>${book.name}</td>
              <td>${book.SaleItem.quantity}</td>
              <td>LKR ${parseFloat(book.SaleItem.price).toFixed(2)}</td>
              <td>${
                book.SaleItem.discount > 0
                  ? `${book.SaleItem.discount} ${
                      book.SaleItem.discount_type === "Fixed" ? "LKR" : "%"
                    }`
                  : "-"
              }</td>
              <td>LKR ${(book.SaleItem.price * book.SaleItem.quantity).toFixed(
                2
              )}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <div style="text-align: right; margin-top: 16px;">
        <p>Subtotal: LKR ${subtotal.toFixed(2)}</p>
        <p>Cart Discount: LKR ${parseFloat(String(sale.discount)).toFixed(
          2
        )}</p>
        <h3>Total: LKR ${parseFloat(String(sale.total_amount)).toFixed(2)}</h3>
      </div>
    `;

      const mailOptions = {
        from: process.env.EMAIL_FROM, // sender address
        to: email, // list of receivers
        subject: `Your receipt for Sale #${sale.id}`, // Subject line
        html: receiptHtml, // html body
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Email sent successfully" });
    } catch (err) {
      console.error("Failed to send email:", err);
      res.status(500).json({ message: "Failed to send email" });
    }
  }
);

export = router;
