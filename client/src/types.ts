// Permission types for role-based access control
export type ModulePermission = "view" | "create" | "edit" | "delete";

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  dashboard: ModulePermissions;
  sales: ModulePermissions;
  inventory: ModulePermissions;
  customers: ModulePermissions;
  reports: ModulePermissions;
  credit: ModulePermissions;
  backups: ModulePermissions;
  issues: ModulePermissions;
  users: ModulePermissions;
  settings: ModulePermissions;
  pos: ModulePermissions;
  suppliers: ModulePermissions;
  warehouses: ModulePermissions;
  services: ModulePermissions;
}

// All available modules
export const ALL_MODULES = [
  "dashboard",
  "sales",
  "inventory",
  "customers",
  "reports",
  "credit",
  "backups",
  "issues",
  "users",
  "settings",
  "pos",
  "suppliers",
  "warehouses",
  "services",
] as const;

export type ModuleName = (typeof ALL_MODULES)[number];

// Module labels for display
export const MODULE_LABELS: Record<ModuleName, string> = {
  dashboard: "Dashboard",
  sales: "Sales History",
  inventory: "Inventory",
  customers: "Customers",
  reports: "Reports",
  credit: "Credit Payments",
  backups: "Backups",
  issues: "Issues",
  users: "Users",
  settings: "Settings",
  pos: "POS (Point of Sale)",
  suppliers: "Suppliers",
  warehouses: "Warehouses",
  services: "Services",
};

// Full access permissions (for initial admin setup)
export const FULL_PERMISSIONS: UserPermissions = {
  dashboard: { view: true, create: true, edit: true, delete: true },
  sales: { view: true, create: true, edit: true, delete: true },
  inventory: { view: true, create: true, edit: true, delete: true },
  customers: { view: true, create: true, edit: true, delete: true },
  reports: { view: true, create: true, edit: true, delete: true },
  credit: { view: true, create: true, edit: true, delete: true },
  backups: { view: true, create: true, edit: true, delete: true },
  issues: { view: true, create: true, edit: true, delete: true },
  users: { view: true, create: true, edit: true, delete: true },
  settings: { view: true, create: true, edit: true, delete: true },
  pos: { view: true, create: true, edit: true, delete: true },
  suppliers: { view: true, create: true, edit: true, delete: true },
  warehouses: { view: true, create: true, edit: true, delete: true },
  services: { view: true, create: true, edit: true, delete: true },
};

// Default permissions for new users (POS only)
export const DEFAULT_PERMISSIONS: UserPermissions = {
  dashboard: { view: false, create: false, edit: false, delete: false },
  sales: { view: false, create: false, edit: false, delete: false },
  inventory: { view: false, create: false, edit: false, delete: false },
  customers: { view: false, create: false, edit: false, delete: false },
  reports: { view: false, create: false, edit: false, delete: false },
  credit: { view: false, create: false, edit: false, delete: false },
  backups: { view: false, create: false, edit: false, delete: false },
  issues: { view: false, create: false, edit: false, delete: false },
  users: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, create: false, edit: false, delete: false },
  pos: { view: true, create: true, edit: false, delete: false },
  suppliers: { view: false, create: false, edit: false, delete: false },
  warehouses: { view: false, create: false, edit: false, delete: false },
  services: { view: false, create: false, edit: false, delete: false },
};

export interface User {
  id: number;
  username: string;
  permissions: UserPermissions;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  credit_balance?: number;
}

export interface SaleItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  discount: number; // per item discount value
  discount_type?: "Fixed" | "Percentage";
}

export interface SaleItemResponse {
  id: number;
  SaleId: number;
  ProductId: number | null;
  quantity: number;
  price: string;
  cost_price: string;
  discount: string;
  discount_type: "Fixed" | "Percentage";
  productName?: string;
  productBrand?: string;
  productBarcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface productWithSaleItem {
  SaleItem: {
    ProductId: number;
    SaleId: number;
    createdAt: string;
    discount: string;
    discount_type: "Fixed" | "Percentage";
    id: number;
    price: string;
    quantity: number;
    updatedAt: string;
  };
  name: string;
  id: number;
  brand?: string | null;
  barcode?: string | null;
  price: number;
  quantity: number;
  supplier?: string | null;
  reorder_threshold: number;
  updatedAt: string;
}

export interface Product {
  id: number;
  barcode?: string | null;
  name: string;
  brand?: string | null;
  supplier?: string | null;
  category?: string | null;
  price: number;
  cost_price?: number;
  quantity?: number;
  reorder_threshold?: number;
  discount?: number;
  discount_type?: "Fixed" | "Percentage";
  SaleItem?: SaleItem; // present in sale responses
  variants?: ProductVariant[]; // product variants
}

export interface Service {
  id: number;
  code?: string | null;
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  cost_price?: number | null;
  discount?: number;
  discount_type?: "Fixed" | "Percentage";
  duration?: number | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: number;
  ProductId: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  cost_price: number | null;
  quantity: number;
  attributes: Record<string, string> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: number;
  customer: Customer;
  products: productWithSaleItem[];
  items: SaleItemResponse[];
  total_amount: number;
  discount: number;
  payment_method: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
}

export interface DashboardStat {
  label: string;
  value: number;
  trend?: number;
}

export interface ConsignmentPayment {
  id: number;
  customerId: number;
  amount: number;
  paymentDate: string;
  note?: string;
  createdAt: string;
}

export interface QuotationItem {
  id: number;
  QuotationId: number;
  ProductId: number;
  quantity: number;
  price: number;
  discount: number;
  discount_type: "Fixed" | "Percentage";
  product?: Product;
}

export interface Quotation {
  id: number;
  total_amount: number;
  CustomerId: number;
  customer?: Customer;
  discount: number;
  expiresAt: string;
  status: "Active" | "Converted";
  items?: QuotationItem[];
  createdAt: string;
}

export interface Backup {
  filename: string;
  size: number;
  createdAt: string;
}
