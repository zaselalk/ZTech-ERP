import express, { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
const db = require("../db/models");
const { Sale, Product, SaleItem } = db;

const router = express.Router();

interface ReportsQueryParams {
  startDate?: string;
  endDate?: string;
}

// Get profit/loss report
router.get(
  "/profit",
  async (
    req: Request<{}, {}, {}, ReportsQueryParams>,
    res: Response
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const where: any = {};

      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate + "T23:59:59.999Z"),
          ],
        };
      }

      // Get all sale items within the date range
      const saleItems = await SaleItem.findAll({
        where,
        include: [
          {
            model: Sale,
            as: "sale",
            attributes: ["id", "createdAt", "payment_method"],
          },
        ],
      });

      let totalRevenue = 0;
      let totalCost = 0;
      let totalItemsSold = 0;

      for (const item of saleItems) {
        const sellingPrice = parseFloat(item.price) || 0;
        const costPrice = parseFloat(item.cost_price) || 0;
        const quantity = item.quantity || 0;
        let discount = parseFloat(item.discount) || 0;

        // Calculate effective selling price after discount
        let effectivePrice = sellingPrice;
        if (item.discount_type === "Percentage") {
          effectivePrice = sellingPrice * (1 - discount / 100);
        } else {
          effectivePrice = sellingPrice - discount;
        }
        effectivePrice = Math.max(0, effectivePrice);

        totalRevenue += effectivePrice * quantity;
        totalCost += costPrice * quantity;
        totalItemsSold += quantity;
      }

      const grossProfit = totalRevenue - totalCost;
      const profitMargin =
        totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      res.json({
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        totalItemsSold,
        totalTransactions: new Set(saleItems.map((item: any) => item.SaleId))
          .size,
      });
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get daily profit trend
router.get(
  "/profit/daily",
  async (
    req: Request<{}, {}, {}, ReportsQueryParams>,
    res: Response
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const where: any = {};

      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate + "T23:59:59.999Z"),
          ],
        };
      } else {
        // Default to last 30 days
        where.createdAt = {
          [Op.between]: [
            new Date(new Date().setDate(new Date().getDate() - 30)),
            new Date(),
          ],
        };
      }

      const saleItems = await SaleItem.findAll({
        where,
        include: [
          {
            model: Sale,
            as: "sale",
            attributes: ["id", "createdAt"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      // Group by date
      const dailyData: Record<
        string,
        { revenue: number; cost: number; profit: number }
      > = {};

      for (const item of saleItems) {
        const date = new Date(item.createdAt).toISOString().split("T")[0];
        if (!dailyData[date]) {
          dailyData[date] = { revenue: 0, cost: 0, profit: 0 };
        }

        const sellingPrice = parseFloat(item.price) || 0;
        const costPrice = parseFloat(item.cost_price) || 0;
        const quantity = item.quantity || 0;
        let discount = parseFloat(item.discount) || 0;

        let effectivePrice = sellingPrice;
        if (item.discount_type === "Percentage") {
          effectivePrice = sellingPrice * (1 - discount / 100);
        } else {
          effectivePrice = sellingPrice - discount;
        }
        effectivePrice = Math.max(0, effectivePrice);

        dailyData[date].revenue += effectivePrice * quantity;
        dailyData[date].cost += costPrice * quantity;
        dailyData[date].profit += (effectivePrice - costPrice) * quantity;
      }

      const result = Object.entries(dailyData).map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        cost: Math.round(data.cost * 100) / 100,
        profit: Math.round(data.profit * 100) / 100,
      }));

      res.json(result);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get product-wise profit report
router.get(
  "/profit/by-product",
  async (
    req: Request<{}, {}, {}, ReportsQueryParams>,
    res: Response
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const where: any = {};

      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate + "T23:59:59.999Z"),
          ],
        };
      }

      const saleItems = await SaleItem.findAll({
        where,
      });

      // Group by product
      const productData: Record<
        string,
        {
          productName: string;
          productId: number | null;
          totalQuantity: number;
          totalRevenue: number;
          totalCost: number;
          profit: number;
        }
      > = {};

      for (const item of saleItems) {
        const key = item.productName || `Product ${item.ProductId}`;
        if (!productData[key]) {
          productData[key] = {
            productName: item.productName || `Product ${item.ProductId}`,
            productId: item.ProductId,
            totalQuantity: 0,
            totalRevenue: 0,
            totalCost: 0,
            profit: 0,
          };
        }

        const sellingPrice = parseFloat(item.price) || 0;
        const costPrice = parseFloat(item.cost_price) || 0;
        const quantity = item.quantity || 0;
        let discount = parseFloat(item.discount) || 0;

        let effectivePrice = sellingPrice;
        if (item.discount_type === "Percentage") {
          effectivePrice = sellingPrice * (1 - discount / 100);
        } else {
          effectivePrice = sellingPrice - discount;
        }
        effectivePrice = Math.max(0, effectivePrice);

        productData[key].totalQuantity += quantity;
        productData[key].totalRevenue += effectivePrice * quantity;
        productData[key].totalCost += costPrice * quantity;
        productData[key].profit += (effectivePrice - costPrice) * quantity;
      }

      const result = Object.values(productData)
        .map((data) => ({
          ...data,
          totalRevenue: Math.round(data.totalRevenue * 100) / 100,
          totalCost: Math.round(data.totalCost * 100) / 100,
          profit: Math.round(data.profit * 100) / 100,
          profitMargin:
            data.totalRevenue > 0
              ? Math.round((data.profit / data.totalRevenue) * 10000) / 100
              : 0,
        }))
        .sort((a, b) => b.profit - a.profit);

      res.json(result);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

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
      const sales = await Sale.findAll({ where, include: ["customer"] });
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
    const lowStockProducts = await Product.findAll({
      where: {
        quantity: {
          [Op.lte]: db.sequelize.col("reorder_threshold"),
        },
      },
    });
    res.json(lowStockProducts);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

export default router;
