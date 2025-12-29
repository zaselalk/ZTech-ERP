import express, { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import db from "../db/models";
import { requireAuth } from "../middleware/requireAuth";
import { requireEditPermission } from "../middleware/requirePermission";
import { env } from "../config/env";

const router = express.Router();

// Initialize Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Helper to check if Cloudinary config is present
const checkCloudinaryConfig = () => {
  return !!(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );
};

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
        logoUrl: null,
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
});

// Update settings
router.put(
  "/",
  requireAuth,
  requireEditPermission("settings"),
  async (req: Request, res: Response) => {
    try {
      const {
        businessName,
        address,
        phone,
        email,
        website,
        receiptFooter,
        logoUrl,
      } = req.body;

      let settings = await db.Settings.findOne();

      if (settings) {
        await settings.update({
          businessName,
          address,
          phone,
          email,
          website,
          receiptFooter,
          logoUrl,
        });
      } else {
        settings = await db.Settings.create({
          businessName,
          address,
          phone,
          email,
          website,
          receiptFooter,
          logoUrl,
        });
      }

      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Error updating settings" });
    }
  }
);

// Upload logo
router.post(
  "/logo",
  requireAuth,
  requireEditPermission("settings"),
  async (req: Request, res: Response) => {
    try {
      if (!checkCloudinaryConfig()) {
        return res
          .status(503)
          .json({ message: "Image upload service not configured" });
      }

      const { image, imageName } = req.body;

      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Determine mime type from extension or default to png
      const ext = (imageName || "logo.png").split(".").pop()?.toLowerCase();
      let mimeType = "image/png";
      if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
      else if (ext === "gif") mimeType = "image/gif";
      else if (ext === "webp") mimeType = "image/webp";

      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${image}`,
        {
          folder: "pos-logos",
          public_id: `business-logo-${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: "limit" }, // Max size
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        }
      );

      // Update settings with new logo URL
      let settings = await db.Settings.findOne();

      if (settings) {
        await settings.update({ logoUrl: uploadResponse.secure_url });
      } else {
        settings = await db.Settings.create({
          businessName: "ZTech POS",
          logoUrl: uploadResponse.secure_url,
        });
      }

      res.json({
        logoUrl: uploadResponse.secure_url,
        message: "Logo uploaded successfully",
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      res
        .status(500)
        .json({ message: "Error uploading logo", error: error.message });
    }
  }
);

// Delete logo
router.delete(
  "/logo",
  requireAuth,
  requireEditPermission("settings"),
  async (req: Request, res: Response) => {
    try {
      let settings = await db.Settings.findOne();

      if (settings && settings.logoUrl) {
        await settings.update({ logoUrl: null });
      }

      res.json({ message: "Logo removed successfully" });
    } catch (error) {
      console.error("Error removing logo:", error);
      res.status(500).json({ message: "Error removing logo" });
    }
  }
);

export default router;
