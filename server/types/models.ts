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

// Bookshop attributes
export interface BookshopAttributes {
  id: number;
  name: string;
  consignment: number;
  location: string | null;
  contact: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Book attributes
export interface BookAttributes {
  id: number;
  barcode: string | null;
  name: string;
  author: string | null;
  publisher: string | null;
  genre: string | null;
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
  BookshopId: number;
  discount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// SaleItem attributes
export interface SaleItemAttributes {
  id: number;
  SaleId: number;
  BookId: number;
  quantity: number;
  price: number;
  discount: number;
  discount_type: "Fixed" | "Percentage";
  createdAt?: Date;
  updatedAt?: Date;
}

// ConsignmentPayment attributes
export interface ConsignmentPaymentAttributes {
  id: number;
  bookshopId: number;
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
  BookshopId: number;
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
  BookId: number;
  quantity: number;
  price: number;
  discount: number;
  discount_type: "Fixed" | "Percentage";
  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes (id is auto-generated)
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}
export interface BookshopCreationAttributes
  extends Optional<BookshopAttributes, "id" | "location" | "contact"> {}
export interface BookCreationAttributes
  extends Optional<
    BookAttributes,
    "id" | "barcode" | "author" | "publisher" | "genre"
  > {}
export interface SaleCreationAttributes
  extends Optional<SaleAttributes, "id"> {}
export interface SaleItemCreationAttributes
  extends Optional<SaleItemAttributes, "id"> {}
export interface ConsignmentPaymentCreationAttributes
  extends Optional<ConsignmentPaymentAttributes, "id"> {}
export interface QuotationCreationAttributes
  extends Optional<QuotationAttributes, "id"> {}
export interface QuotationItemCreationAttributes
  extends Optional<QuotationItemAttributes, "id"> {}

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

export class Bookshop
  extends Model<BookshopAttributes, BookshopCreationAttributes>
  implements BookshopAttributes
{
  public id!: number;
  public name!: string;
  public consignment!: number;
  public location!: string | null;
  public contact!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class Book
  extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes
{
  public id!: number;
  public barcode!: string | null;
  public name!: string;
  public author!: string | null;
  public publisher!: string | null;
  public genre!: string | null;
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
  public BookshopId!: number;
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
  public BookId!: number;
  public quantity!: number;
  public price!: number;
  public discount!: number;
  public discount_type!: "Fixed" | "Percentage";
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
  public bookshopId!: number;
  public amount!: number;
  public paymentDate!: Date;
  public note!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class Quotation
  extends Model<QuotationAttributes, QuotationCreationAttributes>
  implements QuotationAttributes
{
  public id!: number;
  public total_amount!: number;
  public BookshopId!: number;
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
  public BookId!: number;
  public quantity!: number;
  public price!: number;
  public discount!: number;
  public discount_type!: "Fixed" | "Percentage";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
