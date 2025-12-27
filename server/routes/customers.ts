import express, { Request, Response } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
const db = require("../db/models");
const { Customer, Sale, ConsignmentPayment } = db;

const router = express.Router();

// Get all customers
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get a single customer
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Create a new customer
router.post(
  "/",
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json(customer);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a customer
router.put(
  "/:id",
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const [updated] = await Customer.update(req.body, {
        where: { id: req.params.id },
      });
      if (updated) {
        const updatedCustomer = await Customer.findByPk(req.params.id);
        res.status(200).json(updatedCustomer);
      } else {
        res.status(404).json({ message: "Customer not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a customer
router.delete(
  "/:id",
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await Customer.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Customer not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all sales for a customer
router.get(
  "/:id/sales",
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const sales = await Sale.findAll({
        where: { CustomerId: req.params.id },
        order: [["createdAt", "DESC"]],
      });
      res.json(sales);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Add a consignment payment
router.post(
  "/:id/payments",
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { amount, paymentDate, note } = req.body;
    const customerId = req.params.id;

    // Validate customer ID is a valid number
    const parsedCustomerId = parseInt(customerId, 10);
    if (isNaN(parsedCustomerId) || parsedCustomerId <= 0) {
      res
        .status(400)
        .json({ message: "Customer ID must be a valid positive number" });
      return;
    }

    // Validate amount is a positive number and not zero
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      res.status(400).json({
        message: "Amount must be a positive number greater than zero",
      });
      return;
    }

    // Validate paymentDate is provided and is a valid date
    if (!paymentDate) {
      res.status(400).json({ message: "Payment date is required" });
      return;
    }

    const parsedDate = new Date(paymentDate);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ message: "Payment date must be a valid date" });
      return;
    }

    // Validate paymentDate is not in the future
    const now = new Date();
    if (parsedDate > now) {
      res.status(400).json({ message: "Payment date cannot be in the future" });
      return;
    }

    const t = await db.sequelize.transaction();
    try {
      // 1. Create payment record
      const payment = await ConsignmentPayment.create(
        {
          customerId: parsedCustomerId,
          amount,
          paymentDate,
          note,
        },
        { transaction: t }
      );

      // 2. Update customer credit balance (decrement)
      const customer = await Customer.findByPk(parsedCustomerId, {
        transaction: t,
      });
      if (!customer) {
        await t.rollback();
        res.status(404).json({ message: "Customer not found" });
        return;
      }

      // make sure that credit_balance does not go negative
      if (customer.credit_balance < amount) {
        await t.rollback();
        res
          .status(400)
          .json({ message: "Payment amount exceeds credit balance" });
        return;
      }

      // So a payment REDUCES this amount.
      await customer.decrement("credit_balance", {
        by: amount,
        transaction: t,
      });

      await t.commit();
      res.status(201).json(payment);
    } catch (err) {
      await t.rollback();
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Get consignment payments for a customer
router.get(
  "/:id/payments",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const payments = await ConsignmentPayment.findAll({
        where: { customerId: req.params.id },
        order: [
          ["paymentDate", "DESC"],
          ["createdAt", "DESC"],
        ],
      });
      res.json(payments);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
