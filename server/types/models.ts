import { Model, Optional } from "sequelize";

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
] as const;

export type ModuleName = (typeof ALL_MODULES)[number];

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
};

// User attributes
export interface UserAttributes {
  id: number;
  username: string;
  password: string;
  permissions: UserPermissions;
  createdAt?: Date;
  updatedAt?: Date;
}

// Customer attributes
export interface CustomerAttributes {
  id: number;
  name: string; // Can be business name or person name
  credit_balance: number;
  address: string | null;
  phone: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Product attributes
export interface ProductAttributes {
  id: number;
  barcode: string | null;
  name: string;
  brand: string | null;
  supplier: string | null;
  category: string | null;
  quantity: number;
  price: number;
  cost_price: number | null;
  reorder_threshold: number;
  discount: number;
  discount_type: "Fixed" | "Percentage";
  createdAt?: Date;
  updatedAt?: Date;
}

// Sale attributes
export interface SaleAttributes {
  id: number;
  total_amount: number;
  payment_method: "Cash" | "Card" | "Consignment";
  CustomerId: number;
  discount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// SaleItem attributes
export interface SaleItemAttributes {
  id: number;
  SaleId: number;
  ProductId: number;
  quantity: number;
  price: number;
  cost_price: number | null;
  discount: number;
  discount_type: "Fixed" | "Percentage";
  productName?: string;
  productBrand?: string;
  productBarcode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ConsignmentPayment attributes
export interface ConsignmentPaymentAttributes {
  id: number;
  customerId: number;
  amount: number;
  paymentDate: Date;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Quotation attributes
export interface QuotationAttributes {
  id: number;
  total_amount: number;
  CustomerId: number;
  discount: number;
  expiresAt: Date;
  status: "Active" | "Converted";
  createdAt?: Date;
  updatedAt?: Date;
}

// QuotationItem attributes
export interface QuotationItemAttributes {
  id: number;
  QuotationId: number;
  ProductId: number;
  quantity: number;
  price: number;
  discount: number;
  discount_type: "Fixed" | "Percentage";
  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes (Optional for auto-generated fields)
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}
export interface CustomerCreationAttributes
  extends Optional<CustomerAttributes, "id" | "createdAt" | "updatedAt"> {}
export interface ProductCreationAttributes
  extends Optional<ProductAttributes, "id" | "createdAt" | "updatedAt"> {}
export interface SaleCreationAttributes
  extends Optional<SaleAttributes, "id" | "createdAt" | "updatedAt"> {}
export interface SaleItemCreationAttributes
  extends Optional<SaleItemAttributes, "id" | "createdAt" | "updatedAt"> {}
export interface ConsignmentPaymentCreationAttributes
  extends Optional<
    ConsignmentPaymentAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}
export interface QuotationCreationAttributes
  extends Optional<QuotationAttributes, "id" | "createdAt" | "updatedAt"> {}
export interface QuotationItemCreationAttributes
  extends Optional<QuotationItemAttributes, "id" | "createdAt" | "updatedAt"> {}

// Model classes
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password!: string;
  public permissions!: UserPermissions;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  public id!: number;
  public name!: string;
  public credit_balance!: number;
  public address!: string | null;
  public phone!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public barcode!: string | null;
  public name!: string;
  public brand!: string | null;
  public supplier!: string | null;
  public category!: string | null;
  public quantity!: number;
  public price!: number;
  public cost_price!: number | null;
  public reorder_threshold!: number;
  public discount!: number;
  public discount_type!: "Fixed" | "Percentage";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class Sale
  extends Model<SaleAttributes, SaleCreationAttributes>
  implements SaleAttributes
{
  public id!: number;
  public total_amount!: number;
  public payment_method!: "Cash" | "Card" | "Consignment";
  public CustomerId!: number;
  public discount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class SaleItem
  extends Model<SaleItemAttributes, SaleItemCreationAttributes>
  implements SaleItemAttributes
{
  public id!: number;
  public SaleId!: number;
  public ProductId!: number;
  public quantity!: number;
  public price!: number;
  public cost_price!: number | null;
  public discount!: number;
  public discount_type!: "Fixed" | "Percentage";
  public productName?: string;
  public productBrand?: string;
  public productBarcode?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class ConsignmentPayment
  extends Model<
    ConsignmentPaymentAttributes,
    ConsignmentPaymentCreationAttributes
  >
  implements ConsignmentPaymentAttributes
{
  public id!: number;
  public customerId!: number;
  public amount!: number;
  public paymentDate!: Date;
  public note?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class Quotation
  extends Model<QuotationAttributes, QuotationCreationAttributes>
  implements QuotationAttributes
{
  public id!: number;
  public total_amount!: number;
  public CustomerId!: number;
  public discount!: number;
  public expiresAt!: Date;
  public status!: "Active" | "Converted";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class QuotationItem
  extends Model<QuotationItemAttributes, QuotationItemCreationAttributes>
  implements QuotationItemAttributes
{
  public id!: number;
  public QuotationId!: number;
  public ProductId!: number;
  public quantity!: number;
  public price!: number;
  public discount!: number;
  public discount_type!: "Fixed" | "Percentage";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Settings attributes
export interface SettingsAttributes {
  id: number;
  businessName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  receiptFooter: string | null;
  logoUrl: string | null;
  enableSupplierManagement: boolean;
  enableWarehouseManagement: boolean;
  enableProfitTracking: boolean;
  enableCategoryManagement: boolean;
  enableBrandManagement: boolean;
  enableTaxManagement: boolean;
  taxName: string | null;
  taxRate: number | null;
  taxIncludedInPrice: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SettingsCreationAttributes
  extends Optional<SettingsAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Settings
  extends Model<SettingsAttributes, SettingsCreationAttributes>
  implements SettingsAttributes
{
  public id!: number;
  public businessName!: string;
  public address!: string | null;
  public phone!: string | null;
  public email!: string | null;
  public website!: string | null;
  public receiptFooter!: string | null;
  public logoUrl!: string | null;
  public enableSupplierManagement!: boolean;
  public enableWarehouseManagement!: boolean;
  public enableProfitTracking!: boolean;
  public enableCategoryManagement!: boolean;
  public enableBrandManagement!: boolean;
  public enableTaxManagement!: boolean;
  public taxName!: string | null;
  public taxRate!: number | null;
  public taxIncludedInPrice!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Supplier attributes
export interface SupplierAttributes {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierCreationAttributes
  extends Optional<SupplierAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Supplier
  extends Model<SupplierAttributes, SupplierCreationAttributes>
  implements SupplierAttributes
{
  public id!: number;
  public name!: string;
  public contactPerson!: string | null;
  public phone!: string | null;
  public email!: string | null;
  public address!: string | null;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Warehouse attributes
export interface WarehouseAttributes {
  id: number;
  name: string;
  code: string | null;
  location: string | null;
  address: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  capacity: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WarehouseCreationAttributes
  extends Optional<WarehouseAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Warehouse
  extends Model<WarehouseAttributes, WarehouseCreationAttributes>
  implements WarehouseAttributes
{
  public id!: number;
  public name!: string;
  public code!: string | null;
  public location!: string | null;
  public address!: string | null;
  public contactPerson!: string | null;
  public phone!: string | null;
  public email!: string | null;
  public capacity!: number | null;
  public notes!: string | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Purchase attributes
export interface PurchaseAttributes {
  id: number;
  SupplierId: number;
  invoiceNumber: string | null;
  total_amount: number;
  paid_amount: number;
  payment_status: "Unpaid" | "Partial" | "Paid";
  notes: string | null;
  purchaseDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseCreationAttributes
  extends Optional<PurchaseAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Purchase
  extends Model<PurchaseAttributes, PurchaseCreationAttributes>
  implements PurchaseAttributes
{
  public id!: number;
  public SupplierId!: number;
  public invoiceNumber!: string | null;
  public total_amount!: number;
  public paid_amount!: number;
  public payment_status!: "Unpaid" | "Partial" | "Paid";
  public notes!: string | null;
  public purchaseDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// PurchaseItem attributes
export interface PurchaseItemAttributes {
  id: number;
  PurchaseId: number;
  ProductId: number | null;
  productName: string | null;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseItemCreationAttributes
  extends Optional<PurchaseItemAttributes, "id" | "createdAt" | "updatedAt"> {}

export class PurchaseItem
  extends Model<PurchaseItemAttributes, PurchaseItemCreationAttributes>
  implements PurchaseItemAttributes
{
  public id!: number;
  public PurchaseId!: number;
  public ProductId!: number | null;
  public productName!: string | null;
  public quantity!: number;
  public unit_cost!: number;
  public total_cost!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// SupplierPayment attributes
export interface SupplierPaymentAttributes {
  id: number;
  SupplierId: number;
  PurchaseId: number | null;
  amount: number;
  payment_method: "Cash" | "Card" | "Bank Transfer" | "Cheque";
  reference: string | null;
  notes: string | null;
  paymentDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierPaymentCreationAttributes
  extends Optional<
    SupplierPaymentAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

export class SupplierPayment
  extends Model<SupplierPaymentAttributes, SupplierPaymentCreationAttributes>
  implements SupplierPaymentAttributes
{
  public id!: number;
  public SupplierId!: number;
  public PurchaseId!: number | null;
  public amount!: number;
  public payment_method!: "Cash" | "Card" | "Bank Transfer" | "Cheque";
  public reference!: string | null;
  public notes!: string | null;
  public paymentDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// SaleReturn attributes
export interface SaleReturnAttributes {
  id: number;
  SaleId: number;
  CustomerId: number | null;
  total_amount: number;
  refund_method: "Cash" | "Card" | "Credit" | "Exchange";
  reason: string | null;
  notes: string | null;
  returnDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleReturnCreationAttributes
  extends Optional<SaleReturnAttributes, "id" | "createdAt" | "updatedAt"> {}

export class SaleReturn
  extends Model<SaleReturnAttributes, SaleReturnCreationAttributes>
  implements SaleReturnAttributes
{
  public id!: number;
  public SaleId!: number;
  public CustomerId!: number | null;
  public total_amount!: number;
  public refund_method!: "Cash" | "Card" | "Credit" | "Exchange";
  public reason!: string | null;
  public notes!: string | null;
  public returnDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// SaleReturnItem attributes
export interface SaleReturnItemAttributes {
  id: number;
  SaleReturnId: number;
  SaleItemId: number | null;
  ProductId: number | null;
  productName: string | null;
  quantity: number;
  price: number;
  cost_price: number | null;
  refund_amount: number;
  reason: string | null;
  restockInventory: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleReturnItemCreationAttributes
  extends Optional<
    SaleReturnItemAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

export class SaleReturnItem
  extends Model<SaleReturnItemAttributes, SaleReturnItemCreationAttributes>
  implements SaleReturnItemAttributes
{
  public id!: number;
  public SaleReturnId!: number;
  public SaleItemId!: number | null;
  public ProductId!: number | null;
  public productName!: string | null;
  public quantity!: number;
  public price!: number;
  public cost_price!: number | null;
  public refund_amount!: number;
  public reason!: string | null;
  public restockInventory!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// PurchaseReturn attributes
export interface PurchaseReturnAttributes {
  id: number;
  PurchaseId: number;
  SupplierId: number;
  total_amount: number;
  refund_status: "Pending" | "Partial" | "Completed";
  refund_received: number;
  reason: string | null;
  notes: string | null;
  returnDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseReturnCreationAttributes
  extends Optional<
    PurchaseReturnAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

export class PurchaseReturn
  extends Model<PurchaseReturnAttributes, PurchaseReturnCreationAttributes>
  implements PurchaseReturnAttributes
{
  public id!: number;
  public PurchaseId!: number;
  public SupplierId!: number;
  public total_amount!: number;
  public refund_status!: "Pending" | "Partial" | "Completed";
  public refund_received!: number;
  public reason!: string | null;
  public notes!: string | null;
  public returnDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// PurchaseReturnItem attributes
export interface PurchaseReturnItemAttributes {
  id: number;
  PurchaseReturnId: number;
  PurchaseItemId: number | null;
  ProductId: number | null;
  productName: string | null;
  quantity: number;
  unit_cost: number;
  refund_amount: number;
  reason: string | null;
  updateInventory: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseReturnItemCreationAttributes
  extends Optional<
    PurchaseReturnItemAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

export class PurchaseReturnItem
  extends Model<
    PurchaseReturnItemAttributes,
    PurchaseReturnItemCreationAttributes
  >
  implements PurchaseReturnItemAttributes
{
  public id!: number;
  public PurchaseReturnId!: number;
  public PurchaseItemId!: number | null;
  public ProductId!: number | null;
  public productName!: string | null;
  public quantity!: number;
  public unit_cost!: number;
  public refund_amount!: number;
  public reason!: string | null;
  public updateInventory!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
