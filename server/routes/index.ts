import type { Express } from "express";
import passport from "../auth/passport";
import { requireAuth } from "../middleware/requireAuth";

import authRoutes from "./auth";
import bookshopRoutes from "./bookshops";
import bookRoutes from "./books";
import salesRoutes from "./sales";
import reportsRoutes from "./reports";
import dashboardRoutes from "./dashboard";
import backupsRoutes from "./backups";

export function registerRoutes(app: Express): void {
  app.use(passport.initialize());

  app.use("/api/auth", authRoutes);
  app.use("/api/bookshops", requireAuth, bookshopRoutes);
  app.use("/api/books", requireAuth, bookRoutes);
  app.use("/api/sales", requireAuth, salesRoutes);
  app.use("/api/reports", requireAuth, reportsRoutes);
  app.use("/api/dashboard", requireAuth, dashboardRoutes);
  app.use("/api/backups", requireAuth, backupsRoutes);

  app.get("/", (_req, res) => {
    res.send("Bookshop API is running...");
  });
}
