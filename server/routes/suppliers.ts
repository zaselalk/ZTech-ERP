import express, { Request, Response } from "express";
import {
  requireCreatePermission,
  requireEditPermission,
  requireDeletePermission,
} from "../middleware/requirePermission";
const db = require("../db/models");
const { Supplier, Settings, Product } = db;

const router = express.Router();

// Middleware to check if supplier management is enabled
const checkSupplierEnabled = async (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.enableSupplierManagement) {
      res.status(403).json({
        message: "Supplier management is not enabled",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking supplier settings" });
  }
};

// Apply middleware to all routes
router.use(checkSupplierEnabled);

// Get all suppliers
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await Supplier.findAll({
      order: [["name", "ASC"]],
    });
    res.json(suppliers);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get a single supplier
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ message: "Supplier not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Create a new supplier
router.post(
  "/",
  requireCreatePermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, contactPerson, phone, email, address, notes } = req.body;

      if (!name || name.trim() === "") {
        res.status(400).json({ message: "Supplier name is required" });
        return;
      }

      const supplier = await Supplier.create({
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      });

      res.status(201).json(supplier);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a supplier
router.put(
  "/:id",
  requireEditPermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, contactPerson, phone, email, address, notes } = req.body;

      if (name !== undefined && name.trim() === "") {
        res.status(400).json({ message: "Supplier name cannot be empty" });
        return;
      }

      const [updated] = await Supplier.update(
        {
          name: name?.trim(),
          contactPerson: contactPerson?.trim() || null,
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          address: address?.trim() || null,
          notes: notes?.trim() || null,
        },
        {
          where: { id: req.params.id },
        }
      );

      if (updated) {
        const updatedSupplier = await Supplier.findByPk(req.params.id);
        res.status(200).json(updatedSupplier);
      } else {
        res.status(404).json({ message: "Supplier not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a supplier
router.delete(
  "/:id",
  requireDeletePermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await Supplier.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Supplier not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all products for a supplier
router.get(
  "/:id/products",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const supplier = await Supplier.findByPk(req.params.id);
      if (!supplier) {
        res.status(404).json({ message: "Supplier not found" });
        return;
      }

      // Find products where supplier name matches
      const products = await Product.findAll({
        where: { supplier: supplier.name },
        order: [["name", "ASC"]],
      });

      res.json(products);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
