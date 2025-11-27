import { Model, Optional } from "sequelize";

// User attributes
export interface UserAttributes {
  id: number;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Bookshop attributes
export interface BookshopAttributes {
  id: number;
  name: string;
  consignment: number;
  location: string;
  contact: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Book attributes
export interface BookAttributes {
  id: number;
  barcode: string;
  name: string;
  author: string;
  publisher: string;
  genre: string;
  quantity: number;
  price: number;
  reorder_threshold: number;
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

// Creation attributes (id is auto-generated)
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}
export interface BookshopCreationAttributes
  extends Optional<BookshopAttributes, "id"> {}
export interface BookCreationAttributes
  extends Optional<BookAttributes, "id"> {}
export interface SaleCreationAttributes
  extends Optional<SaleAttributes, "id"> {}
export interface SaleItemCreationAttributes
  extends Optional<SaleItemAttributes, "id"> {}

// Model classes
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password!: string;
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
  public location!: string;
  public contact!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class Book
  extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes
{
  public id!: number;
  public barcode!: string;
  public name!: string;
  public author!: string;
  public publisher!: string;
  public genre!: string;
  public quantity!: number;
  public price!: number;
  public reorder_threshold!: number;
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
