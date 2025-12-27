import type { Express } from "express";
import passport from "../auth/passport";
import authRoutes from "./auth";
import customerRoutes from "./customers";
import productRoutes from "./products";
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
  app.use("/api/customers", requireAuth, customerRoutes);
  app.use("/api/products", requireAuth, productRoutes);
  app.use("/api/sales", requireAuth, salesRoutes);
  app.use("/api/reports", requireAuth, requireAdmin, reportsRoutes);
  app.use("/api/dashboard", requireAuth, requireAdmin, dashboardRoutes);
  app.use("/api/backups", requireAuth, requireAdmin, backupsRoutes);
  app.use("/api/issues", requireAuth, requireAdmin, issuesRoutes);
  app.use("/api/users", requireAuth, requireAdmin, usersRoutes);
  app.use("/api/quotations", requireAuth, quotationsRoutes);
}
