import express, { Request, Response } from "express";
const db = require("../db/models");
const { Bookshop, Sale, ConsignmentPayment } = db;

const router = express.Router();

// Get all bookshops
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const bookshops = await Bookshop.findAll();
    res.json(bookshops);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get a single bookshop
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const bookshop = await Bookshop.findByPk(req.params.id);
    if (bookshop) {
      res.json(bookshop);
    } else {
      res.status(404).json({ message: "Bookshop not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Create a new bookshop
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const bookshop = await Bookshop.create(req.body);
    res.status(201).json(bookshop);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
});

// Update a bookshop
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const [updated] = await Bookshop.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedBookshop = await Bookshop.findByPk(req.params.id);
      res.status(200).json(updatedBookshop);
    } else {
      res.status(404).json({ message: "Bookshop not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
});

// Delete a bookshop
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Bookshop.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Bookshop not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get all sales for a bookshop
router.get("/:id/sales", async (req: Request, res: Response): Promise<void> => {
  try {
    const sales = await Sale.findAll({
      where: { BookshopId: req.params.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(sales);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Add a consignment payment
router.post(
  "/:id/payments",
  async (req: Request, res: Response): Promise<void> => {
    const { amount, paymentDate, note } = req.body;
    const bookshopId = req.params.id;

    // Validate bookshop ID is a valid number
    const parsedBookshopId = parseInt(bookshopId, 10);
    if (isNaN(parsedBookshopId) || parsedBookshopId <= 0) {
      res
        .status(400)
        .json({ message: "Bookshop ID must be a valid positive number" });
      return;
    }

    // Validate amount is a positive number and not zero
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      res
        .status(400)
        .json({
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
          bookshopId: parsedBookshopId,
          amount,
          paymentDate,
          note,
        },
        { transaction: t }
      );

      // 2. Update bookshop consignment balance (decrement)
      const bookshop = await Bookshop.findByPk(parsedBookshopId, {
        transaction: t,
      });
      if (!bookshop) {
        await t.rollback();
        res.status(404).json({ message: "Bookshop not found" });
        return;
      }

      // Assuming 'consignment' is the amount OWED by the bookshop.
      // So a payment REDUCES this amount.
      await bookshop.decrement("consignment", { by: amount, transaction: t });

      await t.commit();
      res.status(201).json(payment);
    } catch (err) {
      await t.rollback();
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Get consignment payments for a bookshop
router.get(
  "/:id/payments",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const payments = await ConsignmentPayment.findAll({
        where: { bookshopId: req.params.id },
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

export = router;
