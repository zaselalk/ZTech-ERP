import type { Express } from "express";
import passport from "../auth/passport";
import authRoutes from "./auth";
import customerRoutes from "./customers";
import productRoutes from "./products";
import productVariantsRoutes from "./productVariants";
import salesRoutes from "./sales";
import reportsRoutes from "./reports";
import dashboardRoutes from "./dashboard";
import backupsRoutes from "./backups";
import issuesRoutes from "./issues";
import usersRoutes from "./users";
import quotationsRoutes from "./quotations";
import settingsRoutes from "./settings";
import suppliersRoutes from "./suppliers";
import warehousesRoutes from "./warehouses";
import purchasesRoutes from "./purchases";
import saleReturnsRoutes from "./saleReturns";
import purchaseReturnsRoutes from "./purchaseReturns";
import servicesRoutes from "./services";

import { requireAuth } from "../middleware/requireAuth";
import { requireViewPermission } from "../middleware/requirePermission";

export function registerRoutes(app: Express): void {
  app.use(passport.initialize());

  app.use("/api/auth", authRoutes);

  // Customer routes - requires customers module permission
  app.use(
    "/api/customers",
    requireAuth,
    requireViewPermission("customers"),
    customerRoutes
  );

  // Product routes - requires inventory module permission
  app.use(
    "/api/products",
    requireAuth,
    requireViewPermission("inventory"),
    productRoutes
  );

  // Product Variants routes - requires inventory module permission
  app.use("/api/product-variants", requireAuth, productVariantsRoutes);

  // Sales routes - requires sales module permission (view) or pos (create for new sales)
  app.use("/api/sales", requireAuth, salesRoutes);

  // Reports routes - requires reports module permission
  app.use(
    "/api/reports",
    requireAuth,
    requireViewPermission("reports"),
    reportsRoutes
  );

  // Dashboard routes - requires dashboard module permission
  app.use(
    "/api/dashboard",
    requireAuth,
    requireViewPermission("dashboard"),
    dashboardRoutes
  );

  // Backups routes - requires backups module permission
  app.use(
    "/api/backups",
    requireAuth,
    requireViewPermission("backups"),
    backupsRoutes
  );

  // Issues routes - requires issues module permission
  app.use(
    "/api/issues",
    requireAuth,
    requireViewPermission("issues"),
    issuesRoutes
  );

  // Users routes - requires users module permission
  app.use(
    "/api/users",
    requireAuth,
    requireViewPermission("users"),
    usersRoutes
  );

  // Quotations routes - requires sales or pos permission
  app.use("/api/quotations", requireAuth, quotationsRoutes);

  // Suppliers routes - requires suppliers module permission (feature must be enabled)
  app.use(
    "/api/suppliers",
    requireAuth,
    requireViewPermission("suppliers"),
    suppliersRoutes
  );

  // Warehouses routes - requires warehouses module permission (feature must be enabled)
  app.use(
    "/api/warehouses",
    requireAuth,
    requireViewPermission("warehouses"),
    warehousesRoutes
  );

  // Purchases routes - requires suppliers module permission (feature must be enabled)
  app.use(
    "/api/purchases",
    requireAuth,
    requireViewPermission("suppliers"),
    purchasesRoutes
  );

  // Sale Returns routes - requires sales module permission
  app.use("/api/sale-returns", requireAuth, saleReturnsRoutes);

  // Purchase Returns routes - requires suppliers module permission (feature must be enabled)
  app.use(
    "/api/purchase-returns",
    requireAuth,
    requireViewPermission("suppliers"),
    purchaseReturnsRoutes
  );

  // Services routes - requires inventory module permission (feature must be enabled)
  app.use(
    "/api/services",
    requireAuth,
    requireViewPermission("inventory"),
    servicesRoutes
  );

  // Settings: GET is public (for logo on login page), other methods require settings permission
  app.use("/api/settings", settingsRoutes);
}
