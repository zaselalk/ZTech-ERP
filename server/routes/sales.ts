import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import { col, fn, literal, Op } from "sequelize";
import {
  requireViewPermission,
  requireCreatePermission,
  requireAnyPermission,
} from "../middleware/requirePermission";
const db = require("../db/models");
const { sequelize, Sale, SaleItem, Product, Customer } = db;

const router = express.Router();

interface SaleItem {
  ProductId: number;
  quantity: number;
  discount?: number;
  discount_type?: "Fixed" | "Percentage";
}

interface CartDiscount {
  type: "Fixed" | "Percentage";
  value: number;
}

interface CreateSaleRequestBody {
  CustomerId?: number | null;
  payment_method:
    | "Cash"
    | "Card"
    | "Consignment"
    | "Paid"
    | "Cash On Delivery"
    | "Credit";
  items: SaleItem[];
  cartDiscount?: CartDiscount;
}

interface EmailRequestBody {
  email: string;
  pdfData?: string;
}

// Get all sales
router.get(
  "/",
  requireViewPermission("sales"),
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

      const sales = await Sale.findAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
      });
      res.json(sales);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get daily sales
router.get(
  "/daily-sales-trend",
  requireViewPermission("sales"),
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
  requireViewPermission("sales"),
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

// get sales by customer
router.get(
  "/sales-by-customer",
  requireViewPermission("sales"),
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
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["name"],
          },
        ],
        group: ["CustomerId", "customer.id"],
        attributes: [
          [fn("SUM", col("total_amount")), "totalSales"],
          "CustomerId",
        ],
      });

      res.send(sales);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error);
    }
  }
);

// get sales summary
router.get(
  "/sales-summary",
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

      const result = await Sale.findOne({
        where: whereClause,
        attributes: [
          [fn("SUM", col("total_amount")), "totalSales"],
          [fn("COUNT", col("id")), "totalTransactions"],
          [fn("AVG", col("total_amount")), "averageSale"],
        ],
      });

      res.send(result);
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
      include: ["customer", { model: Product, as: "products" }, "items"],
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
  requireAnyPermission("pos", ["create"]),
  async (
    req: Request<{}, {}, CreateSaleRequestBody>,
    res: Response
  ): Promise<void> => {
    // cartDiscount is the overall discount object { type, value }
    const { CustomerId, payment_method, items, cartDiscount } = req.body;

    if (!payment_method || !items || items.length === 0) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Credit payment requires a customer
    if (payment_method === "Credit" && !CustomerId) {
      res
        .status(400)
        .json({ message: "Customer is required for credit sales" });
      return;
    }

    const t = await sequelize.transaction();
    let subtotalAfterItemDiscounts = 0;

    try {
      // Create the main Sale record first. The final total will be updated later.
      const sale = await Sale.create(
        {
          CustomerId: CustomerId || null,
          payment_method,
          total_amount: 0,
          discount: 0,
        },
        { transaction: t }
      );

      for (const item of items) {
        const product = await Product.findByPk(item.ProductId, {
          transaction: t,
        });

        if (!product)
          throw new Error(`Product with id ${item.ProductId} not found`);
        if (product.quantity < item.quantity)
          throw new Error(`Not enough stock for product: ${product.name}`);

        let itemPrice = parseFloat(product.price);
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
            ProductId: item.ProductId,
            quantity: item.quantity,
            price: product.price, // Store original price
            discount: itemDiscountValue,
            discount_type: item.discount_type || "Fixed",
            productName: product.name,
            productBrand: product.brand,
            productBarcode: product.barcode,
          },
          { transaction: t }
        );

        // Decrement stock
        await product.decrement("quantity", {
          by: item.quantity,
          transaction: t,
        });
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
        const customer = await Customer.findByPk(CustomerId, {
          transaction: t,
        });
        if (customer) {
          await customer.increment("credit_balance", {
            by: finalTotalAmount,
            transaction: t,
          });
        }
      }

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

import { generateReceiptPdf } from "../utils/receiptGenerator";

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
        include: ["customer", { model: Product, as: "products" }],
      });

      if (!sale) {
        res.status(404).json({ message: "Sale not found" });
        return;
      }

      // Generate PDF
      const pdfBuffer = await generateReceiptPdf(sale);

      // Generate HTML for the receipt
      const subtotal = sale.products.reduce(
        (acc: number, product: any) =>
          acc + product.SaleItem.price * product.SaleItem.quantity,
        0
      );

      const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #2980b9; margin: 0; }
          .header p { margin: 5px 0; color: #777; font-size: 0.9em; }
          .receipt-info { margin-bottom: 20px; padding: 15px; background: #fff; border-radius: 5px; border-left: 4px solid #2980b9; }
          .receipt-info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; font-size: 1.2em; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Receipt</h1>
            <p>Thank you for your purchase!</p>
          </div>
          <div class="receipt-info">
            <p><strong>Receipt ID:</strong> ${sale.id}</p>
            <p><strong>Date:</strong> ${new Date(
              sale.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${sale.customer.name}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.products
                .map(
                  (product: any) => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.SaleItem.quantity}</td>
                  <td>${product.SaleItem.price}</td>
                  <td>${(
                    product.SaleItem.price * product.SaleItem.quantity
                  ).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">
            <p>Total: ${sale.total_amount}</p>
          </div>
          <div class="footer">
            <p>If you have any questions, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `Receipt for Sale #${sale.id}`,
        html: receiptHtml,
        attachments: [
          {
            filename: `receipt-${sale.id}.pdf`,
            content: pdfBuffer,
          },
        ],
      };

      await transporter.sendMail(mailOptions);

      res.json({ message: "Email sent successfully" });
    } catch (err) {
      const error = err as Error;
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  }
);

export default router;
