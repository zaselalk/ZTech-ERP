import express, { Request, Response } from "express";
import db from "../db/models";
import { requireAdmin } from "../middleware/requireAdmin";

const router = express.Router();

// Get settings
router.get("/", async (req: Request, res: Response) => {
  try {
    let settings = await db.Settings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await db.Settings.create({
        businessName: "ZTech POS",
        address: "123 Main St, City",
        phone: "0123456789",
        email: "info@example.com",
        receiptFooter: "Thank you for shopping with us!",
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
});

// Update settings
router.put("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { businessName, address, phone, email, website, receiptFooter } =
      req.body;

    let settings = await db.Settings.findOne();

    if (settings) {
      await settings.update({
        businessName,
        address,
        phone,
        email,
        website,
        receiptFooter,
      });
    } else {
      settings = await db.Settings.create({
        businessName,
        address,
        phone,
        email,
        website,
        receiptFooter,
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Error updating settings" });
  }
});

export default router;
