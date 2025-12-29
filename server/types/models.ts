import { Model, Optional } from "sequelize";

// User attributes
export interface UserAttributes {
  id: number;
  username: string;
  password: string;
  role: "admin" | "staff";
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
  public role!: "admin" | "staff";
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
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
