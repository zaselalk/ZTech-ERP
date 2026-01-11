/**
 * Test Fixtures
 * 
 * Reusable test data for various entities
 */

export const mockUsers = {
  admin: {
    username: "admin",
    password: "admin123", // Will be hashed in tests
    email: "admin@example.com",
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
  },
  staff: {
    username: "staff",
    password: "staff123",
    email: "staff@example.com",
    role: "staff",
    permissions: {
      products: { view: true, create: true, edit: true, delete: false },
      sales: { view: true, create: true, edit: false, delete: false },
      purchases: { view: true, create: false, edit: false, delete: false },
      customers: { view: true, create: true, edit: true, delete: false },
      suppliers: { view: true, create: false, edit: false, delete: false },
      warehouses: { view: true, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: true, create: false, edit: false, delete: false },
      dashboard: { view: true, create: false, edit: false, delete: false },
    },
  },
};

export const mockWarehouses = [
  {
    name: "Main Warehouse",
    location: "123 Main Street, City",
    phone: "1234567890",
    email: "main@warehouse.com",
  },
  {
    name: "Secondary Warehouse",
    location: "456 Second Avenue, City",
    phone: "0987654321",
    email: "secondary@warehouse.com",
  },
];

export const mockCustomers = [
  {
    name: "John Doe",
    email: "john@example.com",
    phone: "5551234567",
    address: "789 Customer Lane, City",
    creditLimit: 5000,
    creditBalance: 0,
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "5559876543",
    address: "321 Buyer Street, City",
    creditLimit: 10000,
    creditBalance: 2500,
  },
];

export const mockSuppliers = [
  {
    name: "ABC Suppliers Inc",
    email: "contact@abcsuppliers.com",
    phone: "5551111111",
    address: "999 Supplier Blvd, City",
    creditBalance: 0,
  },
  {
    name: "XYZ Wholesale",
    email: "sales@xyzwholesale.com",
    phone: "5552222222",
    address: "888 Wholesale Way, City",
    creditBalance: 1500,
  },
];

export const mockProducts = [
  {
    name: "Product A",
    sku: "PROD-A-001",
    barcode: "1234567890001",
    description: "High quality product A",
    category: "Category 1",
    unit: "piece",
    costPrice: 50,
    sellingPrice: 100,
    quantity: 100,
    reorderLevel: 20,
  },
  {
    name: "Product B",
    sku: "PROD-B-002",
    barcode: "1234567890002",
    description: "Premium product B",
    category: "Category 2",
    unit: "box",
    costPrice: 200,
    sellingPrice: 350,
    quantity: 50,
    reorderLevel: 10,
  },
  {
    name: "Product C",
    sku: "PROD-C-003",
    barcode: "1234567890003",
    description: "Standard product C",
    category: "Category 1",
    unit: "piece",
    costPrice: 25,
    sellingPrice: 50,
    quantity: 200,
    reorderLevel: 30,
  },
];

export const mockSales = [
  {
    customerId: null, // Will be set in tests
    totalAmount: 300,
    paymentMethod: "cash",
    paymentStatus: "paid",
    items: [
      {
        productId: null, // Will be set in tests
        quantity: 2,
        price: 100,
        discount: 0,
      },
      {
        productId: null, // Will be set in tests
        quantity: 1,
        price: 100,
        discount: 0,
      },
    ],
  },
];

export const mockPurchases = [
  {
    supplierId: null, // Will be set in tests
    invoiceNumber: "INV-001",
    totalAmount: 500,
    paymentStatus: "pending",
    items: [
      {
        productId: null, // Will be set in tests
        quantity: 10,
        price: 50,
      },
    ],
  },
];

export const mockQuotations = [
  {
    customerId: null, // Will be set in tests
    totalAmount: 450,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: "pending",
    items: [
      {
        productId: null, // Will be set in tests
        quantity: 3,
        price: 100,
        discount: 0,
      },
      {
        productId: null, // Will be set in tests
        quantity: 1,
        price: 150,
        discount: 0,
      },
    ],
  },
];

/**
 * Helper function to create a mock product with custom overrides
 */
export function createMockProduct(overrides: any = {}) {
  return {
    name: "Test Product",
    sku: `TEST-${Math.random().toString(36).substr(2, 9)}`,
    barcode: Math.random().toString().substr(2, 13),
    description: "A test product",
    category: "Test Category",
    unit: "piece",
    costPrice: 50,
    sellingPrice: 100,
    quantity: 50,
    reorderLevel: 10,
    ...overrides,
  };
}

/**
 * Helper function to create a mock customer with custom overrides
 */
export function createMockCustomer(overrides: any = {}) {
  return {
    name: "Test Customer",
    email: `customer${Math.random().toString(36).substr(2, 5)}@test.com`,
    phone: "1234567890",
    address: "Test Address",
    creditLimit: 5000,
    creditBalance: 0,
    ...overrides,
  };
}

/**
 * Helper function to create a mock sale with custom overrides
 */
export function createMockSale(overrides: any = {}) {
  return {
    totalAmount: 100,
    paymentMethod: "cash",
    paymentStatus: "paid",
    ...overrides,
  };
}
