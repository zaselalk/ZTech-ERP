import type { Express } from "express";
import passport from "../auth/passport";
import authRoutes from "./auth";
import bookshopRoutes from "./bookshops";
import bookRoutes from "./books";
import salesRoutes from "./sales";
import reportsRoutes from "./reports";
import dashboardRoutes from "./dashboard";
import backupsRoutes from "./backups";
import issuesRoutes from "./issues";
import usersRoutes from "./users";
import quotationsRoutes from "./quotations";

import { requireAdmin } from "../middleware/requireAdmin";
import { requireAuth } from "../middleware/requireAuth";

export function registerRoutes(app: Express): void {
  app.use(passport.initialize());

  app.use("/api/auth", authRoutes);
  app.use("/api/bookshops", requireAuth, bookshopRoutes);
  app.use("/api/books", requireAuth, bookRoutes);
  app.use("/api/sales", requireAuth, salesRoutes);
  app.use("/api/reports", requireAuth, requireAdmin, reportsRoutes);
  app.use("/api/dashboard", requireAuth, requireAdmin, dashboardRoutes);
  app.use("/api/backups", requireAuth, requireAdmin, backupsRoutes);
  app.use("/api/issues", requireAuth, requireAdmin, issuesRoutes);
  app.use("/api/users", requireAuth, requireAdmin, usersRoutes);
  app.use("/api/quotations", requireAuth, quotationsRoutes);

  app.get("/", (_req, res) => {
    res.send("Bookshop API is running...");
  });
}
