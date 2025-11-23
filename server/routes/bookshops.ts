import express, { Request, Response } from "express";
const db = require("../db/models");
const { Bookshop, Sale } = db;

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
    });
    res.json(sales);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

export = router;
