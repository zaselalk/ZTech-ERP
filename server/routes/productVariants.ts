import express, { Request, Response } from "express";
import { Op } from "sequelize";
import {
  requireViewPermission,
  requireCreatePermission,
  requireEditPermission,
  requireDeletePermission,
} from "../middleware/requirePermission";
const db = require("../db/models");
const { ProductVariant, Product } = db;

const router = express.Router();

// Get all variants for a product
router.get(
  "/product/:productId",
  requireViewPermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const { includeInactive } = req.query;

      const where: any = { ProductId: productId };
      if (!includeInactive) {
        where.isActive = true;
      }

      const variants = await ProductVariant.findAll({
        where,
        order: [["name", "ASC"]],
      });
      res.json(variants);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get a single variant
router.get(
  "/:id",
  requireViewPermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const variant = await ProductVariant.findByPk(req.params.id, {
        include: [
          {
            model: Product,
            as: "product",
          },
        ],
      });
      if (variant) {
        res.json(variant);
      } else {
        res.status(404).json({ message: "Variant not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Search variants by barcode or SKU
router.get(
  "/search/:query",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.params;

      const variant = await ProductVariant.findOne({
        where: {
          [Op.or]: [{ barcode: query }, { sku: query }],
          isActive: true,
        },
        include: [
          {
            model: Product,
            as: "product",
          },
        ],
      });

      if (variant) {
        res.json(variant);
      } else {
        res.status(404).json({ message: "Variant not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a variant
router.post(
  "/",
  requireCreatePermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        ProductId,
        name,
        sku,
        barcode,
        price,
        cost_price,
        quantity,
        attributes,
      } = req.body;

      // Validate product exists
      const product = await Product.findByPk(ProductId);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      // Check for duplicate SKU if provided
      if (sku) {
        const existingSku = await ProductVariant.findOne({ where: { sku } });
        if (existingSku) {
          res.status(400).json({ message: "SKU already exists" });
          return;
        }
      }

      // Check for duplicate barcode if provided
      if (barcode) {
        const existingBarcode = await ProductVariant.findOne({
          where: { barcode },
        });
        if (existingBarcode) {
          res.status(400).json({ message: "Barcode already exists" });
          return;
        }
      }

      const variant = await ProductVariant.create({
        ProductId,
        name,
        sku: sku || null,
        barcode: barcode || null,
        price: price || null,
        cost_price: cost_price || null,
        quantity: quantity || 0,
        attributes: attributes || null,
        isActive: true,
      });

      res.status(201).json(variant);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a variant
router.put(
  "/:id",
  requireEditPermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const variant = await ProductVariant.findByPk(req.params.id);
      if (!variant) {
        res.status(404).json({ message: "Variant not found" });
        return;
      }

      const {
        name,
        sku,
        barcode,
        price,
        cost_price,
        quantity,
        attributes,
        isActive,
      } = req.body;

      // Check for duplicate SKU if changed
      if (sku && sku !== variant.sku) {
        const existingSku = await ProductVariant.findOne({ where: { sku } });
        if (existingSku) {
          res.status(400).json({ message: "SKU already exists" });
          return;
        }
      }

      // Check for duplicate barcode if changed
      if (barcode && barcode !== variant.barcode) {
        const existingBarcode = await ProductVariant.findOne({
          where: { barcode },
        });
        if (existingBarcode) {
          res.status(400).json({ message: "Barcode already exists" });
          return;
        }
      }

      await variant.update({
        name: name !== undefined ? name : variant.name,
        sku: sku !== undefined ? sku || null : variant.sku,
        barcode: barcode !== undefined ? barcode || null : variant.barcode,
        price: price !== undefined ? price || null : variant.price,
        cost_price:
          cost_price !== undefined ? cost_price || null : variant.cost_price,
        quantity: quantity !== undefined ? quantity : variant.quantity,
        attributes:
          attributes !== undefined ? attributes || null : variant.attributes,
        isActive: isActive !== undefined ? isActive : variant.isActive,
      });

      res.json(variant);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Update variant stock
router.patch(
  "/:id/stock",
  requireEditPermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const variant = await ProductVariant.findByPk(req.params.id);
      if (!variant) {
        res.status(404).json({ message: "Variant not found" });
        return;
      }

      const { quantity, adjustment } = req.body;

      if (quantity !== undefined) {
        await variant.update({ quantity });
      } else if (adjustment !== undefined) {
        await variant.update({ quantity: variant.quantity + adjustment });
      }

      res.json(variant);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a variant (soft delete by setting isActive to false)
router.delete(
  "/:id",
  requireDeletePermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const variant = await ProductVariant.findByPk(req.params.id);
      if (variant) {
        // Soft delete
        await variant.update({ isActive: false });
        res.json({ message: "Variant deleted" });
      } else {
        res.status(404).json({ message: "Variant not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Hard delete a variant (permanent deletion)
router.delete(
  "/:id/permanent",
  requireDeletePermission("inventory"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const variant = await ProductVariant.findByPk(req.params.id);
      if (variant) {
        await variant.destroy();
        res.json({ message: "Variant permanently deleted" });
      } else {
        res.status(404).json({ message: "Variant not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
