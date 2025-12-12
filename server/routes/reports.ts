import express, { Request, Response } from "express";
import { Op } from "sequelize";
const db = require("../db/models");
const { Sale, Book } = db;

const router = express.Router();

interface ReportsQueryParams {
  startDate?: string;
  endDate?: string;
}

// Get sales report
router.get(
  "/sales",
  async (
    req: Request<{}, {}, {}, ReportsQueryParams>,
    res: Response
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }
      const sales = await Sale.findAll({ where, include: ["bookshop"] });
      res.json(sales);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get low stock report
router.get("/low-stock", async (req: Request, res: Response): Promise<void> => {
  try {
    const lowStockBooks = await Book.findAll({
      where: {
        quantity: {
          [Op.lte]: db.sequelize.col("reorder_threshold"),
        },
      },
    });
    res.json(lowStockBooks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

export = router;
