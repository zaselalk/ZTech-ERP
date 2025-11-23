import express, { Request, Response } from "express";
import { Op } from "sequelize";
import * as sequelize from "sequelize";
const db = require("../db/models");
const { Sale, Book, Bookshop } = db;

const router = express.Router();

router.get("/stats", async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalSalesToday = await Sale.sum("total_amount", {
      where: { createdAt: { [Op.gte]: today } },
    });

    const totalSalesWeek = await Sale.sum("total_amount", {
      where: { createdAt: { [Op.gte]: startOfWeek } },
    });

    const totalSalesMonth = await Sale.sum("total_amount", {
      where: { createdAt: { [Op.gte]: startOfMonth } },
    });

    const totalBooks = await Book.sum("quantity");

    const lowStockCount = await Book.count({
      where: {
        quantity: {
          [Op.lte]: sequelize.col("reorder_threshold"),
        },
      },
    });

    const recentSales = await Sale.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: ["bookshop"],
    });

    const totalConsignment = await Bookshop.sum("consignment");

    res.json({
      totalSalesToday: totalSalesToday || 0,
      totalSalesWeek: totalSalesWeek || 0,
      totalSalesMonth: totalSalesMonth || 0,
      totalBooks: totalBooks || 0,
      lowStockCount: lowStockCount || 0,
      recentSales,
      totalConsignment: totalConsignment || 0,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

export = router;
