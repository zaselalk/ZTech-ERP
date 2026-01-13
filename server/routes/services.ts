import { Router, Request, Response, NextFunction } from "express";
import db from "../db/models";

const router = Router();

// Get all services
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await db.Service.findAll({
      order: [["name", "ASC"]],
    });
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// Get active services only (for POS)
router.get(
  "/active",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const services = await db.Service.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      res.json(services);
    } catch (error) {
      next(error);
    }
  }
);

// Get single service
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const service_id = req.params.id as string;

  try {
    const service = await db.Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Create service
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      code,
      name,
      description,
      category,
      price,
      cost_price,
      discount,
      discount_type,
      duration,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Service name is required" });
    }

    // Check for duplicate code if provided
    if (code) {
      const existingService = await db.Service.findOne({ where: { code } });
      if (existingService) {
        return res.status(400).json({ message: "Service code already exists" });
      }
    }

    const service = await db.Service.create({
      code: code || null,
      name,
      description: description || null,
      category: category || null,
      price: price || 0,
      cost_price: cost_price || null,
      discount: discount || 0,
      discount_type: discount_type || "Percentage",
      duration: duration || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

// Update service
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const service_id = req.params.id as string;

  try {
    const service = await db.Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const {
      code,
      name,
      description,
      category,
      price,
      cost_price,
      discount,
      discount_type,
      duration,
      isActive,
    } = req.body;

    // Check for duplicate code if changed
    if (code && code !== service.code) {
      const existingService = await db.Service.findOne({ where: { code } });
      if (existingService) {
        return res.status(400).json({ message: "Service code already exists" });
      }
    }

    await service.update({
      code: code !== undefined ? code : service.code,
      name: name !== undefined ? name : service.name,
      description:
        description !== undefined ? description : service.description,
      category: category !== undefined ? category : service.category,
      price: price !== undefined ? price : service.price,
      cost_price: cost_price !== undefined ? cost_price : service.cost_price,
      discount: discount !== undefined ? discount : service.discount,
      discount_type:
        discount_type !== undefined ? discount_type : service.discount_type,
      duration: duration !== undefined ? duration : service.duration,
      isActive: isActive !== undefined ? isActive : service.isActive,
    });

    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Delete service
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const service_id = req.params.id as string;

    try {
      const service = await db.Service.findByPk(service_id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      await service.destroy();
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// Toggle service active status
router.patch(
  "/:id/toggle",
  async (req: Request, res: Response, next: NextFunction) => {
    const service_id = req.params.id as string;

    try {
      const service = await db.Service.findByPk(service_id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      await service.update({ isActive: !service.isActive });
      res.json(service);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
