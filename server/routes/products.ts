import express, { Request, Response } from "express";
import { Op } from "sequelize";
import {
  requireViewPermission,
  requireCreatePermission,
  requireEditPermission,
  requireDeletePermission,
} from "../middleware/requirePermission";
const db = require("../db/models");
const { Product, SaleItem, Sale, Customer } = db;

const router = express.Router();

interface ProductsQueryParams {
  search?: string;
  type?: "name" | "barcode";
}

// Get all products
router.get(
  "/",
  async (
    req: Request<{}, {}, {}, ProductsQueryParams>,
    res: Response
  ): Promise<void> => {
    try {
      const { search, type } = req.query;
      let where = {};
      if (search) {
        if (type === "barcode") {
          where = { barcode: { [Op.like]: `%${search}%` } };
        } else {
          where = {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { brand: { [Op.like]: `%${search}%` } },
              { category: { [Op.like]: `%${search}%` } },
            ],
          };
        }
      }
      const products = await Product.findAll({ where });
      res.json(products);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get top seller products
router.get(
  "/top-sellers",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await Product.findAll({ limit: 12 });
      res.json(products);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get low stock products
router.get(
  "/low-stock",
  requireViewPermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await Product.findAll({
        where: {
          quantity: {
            [Op.lte]: db.sequelize.col("reorder_threshold"),
          },
        },
      });
      res.json(products);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get a single product
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get stats for a single product
router.get(
  "/:id/stats",
  requireViewPermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      const saleItems = await SaleItem.findAll({
        where: { ProductId: product.id },
        include: [
          {
            model: Sale,
            as: "sale",
            include: [{ model: Customer, as: "customer" }],
          },
        ],
      });

      const totalSold = saleItems.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
      const totalRevenue = saleItems.reduce(
        (sum: number, item: any) => sum + Number(item.price) * item.quantity,
        0
      );

      res.json({
        totalSold,
        totalRevenue,
        sales: saleItems,
      });
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a product
router.post(
  "/",
  requireCreatePermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a product
router.put(
  "/:id",
  requireEditPermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (product) {
        await product.update(req.body);
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a product
router.delete(
  "/:id",
  requireDeletePermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (product) {
        await product.destroy();
        res.json({ message: "Product deleted" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
