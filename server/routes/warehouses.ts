import express, { Request, Response } from "express";
import {
  requireCreatePermission,
  requireEditPermission,
  requireDeletePermission,
} from "../middleware/requirePermission";
const db = require("../db/models");
const { Warehouse, Settings } = db;

const router = express.Router();

// Middleware to check if warehouse management is enabled
const checkWarehouseEnabled = async (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.enableWarehouseManagement) {
      res.status(403).json({
        message: "Warehouse management is not enabled",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking warehouse settings" });
  }
};

// Apply middleware to all routes
router.use(checkWarehouseEnabled);

// Get all warehouses
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { activeOnly } = req.query;
    const whereClause = activeOnly === "true" ? { isActive: true } : {};

    const warehouses = await Warehouse.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });
    res.json(warehouses);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get a single warehouse
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (warehouse) {
      res.json(warehouse);
    } else {
      res.status(404).json({ message: "Warehouse not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Create a new warehouse
router.post(
  "/",
  requireCreatePermission("warehouses"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        code,
        location,
        address,
        contactPerson,
        phone,
        email,
        capacity,
        notes,
        isActive,
      } = req.body;

      if (!name || name.trim() === "") {
        res.status(400).json({ message: "Warehouse name is required" });
        return;
      }

      // Check for duplicate code if provided
      if (code && code.trim() !== "") {
        const existingWarehouse = await Warehouse.findOne({
          where: { code: code.trim() },
        });
        if (existingWarehouse) {
          res.status(400).json({ message: "Warehouse code already exists" });
          return;
        }
      }

      const warehouse = await Warehouse.create({
        name: name.trim(),
        code: code?.trim() || null,
        location: location?.trim() || null,
        address: address?.trim() || null,
        contactPerson: contactPerson?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        capacity: capacity || null,
        notes: notes?.trim() || null,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json(warehouse);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a warehouse
router.put(
  "/:id",
  requireEditPermission("warehouses"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        code,
        location,
        address,
        contactPerson,
        phone,
        email,
        capacity,
        notes,
        isActive,
      } = req.body;

      if (name !== undefined && name.trim() === "") {
        res.status(400).json({ message: "Warehouse name cannot be empty" });
        return;
      }

      // Check for duplicate code if provided (excluding current warehouse)
      if (code && code.trim() !== "") {
        const existingWarehouse = await Warehouse.findOne({
          where: { code: code.trim() },
        });
        if (
          existingWarehouse &&
          existingWarehouse.id !== parseInt(req.params.id)
        ) {
          res.status(400).json({ message: "Warehouse code already exists" });
          return;
        }
      }

      const [updated] = await Warehouse.update(
        {
          name: name?.trim(),
          code: code?.trim() || null,
          location: location?.trim() || null,
          address: address?.trim() || null,
          contactPerson: contactPerson?.trim() || null,
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          capacity: capacity || null,
          notes: notes?.trim() || null,
          isActive: isActive,
        },
        {
          where: { id: req.params.id },
        }
      );

      if (updated) {
        const updatedWarehouse = await Warehouse.findByPk(req.params.id);
        res.status(200).json(updatedWarehouse);
      } else {
        res.status(404).json({ message: "Warehouse not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a warehouse
router.delete(
  "/:id",
  requireDeletePermission("warehouses"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await Warehouse.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Warehouse not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Toggle warehouse active status
router.patch(
  "/:id/toggle-active",
  requireEditPermission("warehouses"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const warehouse = await Warehouse.findByPk(req.params.id);
      if (!warehouse) {
        res.status(404).json({ message: "Warehouse not found" });
        return;
      }

      await warehouse.update({ isActive: !warehouse.isActive });
      res.json(warehouse);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
