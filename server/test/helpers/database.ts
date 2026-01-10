/**
 * Database Test Helper
 * 
 * This module provides utilities for setting up and tearing down
 * the test database for integration tests.
 */

import { Sequelize } from "sequelize";

let sequelizeInstance: Sequelize | null = null;

/**
 * Initialize test database connection
 */
export async function initTestDatabase(): Promise<Sequelize> {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }

  sequelizeInstance = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "ztech_erp_test",
    logging: false, // Disable SQL logging in tests
  });

  try {
    await sequelizeInstance.authenticate();
    console.log("Test database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to test database:", error);
    throw error;
  }

  return sequelizeInstance;
}

/**
 * Close test database connection
 */
export async function closeTestDatabase(): Promise<void> {
  if (sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = null;
    console.log("Test database connection closed.");
  }
}

/**
 * Sync database schema (creates tables)
 * WARNING: This will drop all tables if force is true
 */
export async function syncTestDatabase(force = false): Promise<void> {
  const db = require("../../db/models");
  await db.sequelize.sync({ force });

  if (force) {
    console.log("Test database schema reset successfully.");
  } else {
    console.log("Test database schema synced successfully.");
  }
}

/**
 * Clear all data from tables without dropping them
 */
export async function clearTestDatabase(): Promise<void> {
  const db = require("../../db/models");

  // Order matters due to foreign key constraints
  const models = [
    "SaleReturnItem",
    "SaleReturn",
    "PurchaseReturnItem",
    "PurchaseReturn",
    "QuotationItem",
    "Quotation",
    "SaleItem",
    "Sale",
    "PurchaseItem",
    "Purchase",
    "ConsignmentPayment",
    "SupplierPayment",
    "Product",
    "Customer",
    "Supplier",
    "Warehouse",
    "User",
    "Settings",
  ];

  for (const modelName of models) {
    if (db[modelName]) {
      await db[modelName].destroy({ where: {}, force: true });
    }
  }

  console.log("Test database cleared successfully.");
}

/**
 * Seed test database with basic data
 */
export async function seedTestDatabase(): Promise<{
  user: any;
  warehouse: any;
  customer: any;
  supplier: any;
  product: any;
}> {
  const db = require("../../db/models");
  const bcrypt = require("bcrypt");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await db.User.create({
    username: "testuser",
    password: hashedPassword,
    email: "test@example.com",
    role: "admin",
    permissions: {
      products: { view: true, create: true, edit: true, delete: true },
      sales: { view: true, create: true, edit: true, delete: true },
      purchases: { view: true, create: true, edit: true, delete: true },
      customers: { view: true, create: true, edit: true, delete: true },
      suppliers: { view: true, create: true, edit: true, delete: true },
      warehouses: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: true, create: false, edit: true, delete: false },
      dashboard: { view: true, create: false, edit: false, delete: false },
    },
  });

  // Create test warehouse
  const warehouse = await db.Warehouse.create({
    name: "Test Warehouse",
    location: "Test Location",
    phone: "1234567890",
    email: "warehouse@test.com",
  });

  // Create test customer
  const customer = await db.Customer.create({
    name: "Test Customer",
    email: "customer@test.com",
    phone: "0987654321",
    address: "123 Test Street",
    creditLimit: 10000,
    creditBalance: 0,
  });

  // Create test supplier
  const supplier = await db.Supplier.create({
    name: "Test Supplier",
    email: "supplier@test.com",
    phone: "1122334455",
    address: "456 Supplier Avenue",
    creditBalance: 0,
  });

  // Create test product
  const product = await db.Product.create({
    name: "Test Product",
    sku: "TEST-001",
    barcode: "1234567890123",
    description: "A test product",
    category: "Test Category",
    unit: "piece",
    costPrice: 50,
    sellingPrice: 100,
    quantity: 100,
    reorderLevel: 10,
    warehouseId: warehouse.id,
  });

  console.log("Test database seeded successfully.");

  return { user, warehouse, customer, supplier, product };
}

/**
 * Helper to run a test with a fresh database
 * Usage:
 * 
 * describe('My Test Suite', () => {
 *   beforeAll(async () => {
 *     await withFreshDatabase(async () => {
 *       // Your test setup code
 *     });
 *   });
 * });
 */
export async function withFreshDatabase<T>(
  callback: () => Promise<T>
): Promise<T> {
  await initTestDatabase();
  await syncTestDatabase(true);
  const result = await callback();
  await closeTestDatabase();
  return result;
}
