export interface User {
  id: number;
  username: string;
  role: "admin" | "staff";
  createdAt: string;
}

export interface Bookshop {
  id: number;
  name: string;
  location?: string;
  contact?: string;
  consignment?: number; // amount pending or consignment flag stored as number
}

export interface SaleItem {
  id: number;
  bookId: number;
  quantity: number;
  price: number;
  discount: number; // per item discount value
  discount_type?: "Fixed" | "Percentage";
}

export interface SaleItemResponse {
  id: number;
  SaleId: number;
  BookId: number | null;
  quantity: number;
  price: string;
  discount: string;
  discount_type: "Fixed" | "Percentage";
  bookName?: string;
  bookAuthor?: string;
  bookBarcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface bookWithSaleItem {
  SaleItem: {
    BookId: number;
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
  author?: string | null;
  barcode?: string | null;
  price: number;
  quantity: number;
  publisher?: string | null;
  reorder_threshold: number;
  updatedAt: string;
}

export interface Book {
  id: number;
  barcode?: string | null;
  name: string;
  author?: string | null;
  publisher?: string | null;
  genre?: string | null;
  price: number;
  quantity?: number;
  reorder_threshold?: number;
  discount?: number;
  discount_type?: "Fixed" | "Percentage";
  consignment?: boolean;
  SaleItem?: SaleItem; // present in sale responses
}

export interface Sale {
  id: number;
  bookshop: Bookshop;
  books: bookWithSaleItem[];
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

export interface DailySalesPoint {
  date: string; // ISO date
  total: number;
}

export interface ChartDataShape {
  dailySales: [string, number][];
  bookshopSales: [string, number][];
  paymentMethods: [string, number][];
}

export type ApiHeaders = Record<string, string>;

export interface ApiOptions extends RequestInit {
  headers?: ApiHeaders;
}

export interface ConsignmentPayment {
  id: number;
  bookshopId: number;
  amount: number;
  paymentDate: string;
  note?: string;
  createdAt: string;
}

export interface QuotationItem {
  id: number;
  BookId: number;
  quantity: number;
  price: number;
  discount: number;
  discount_type: "Fixed" | "Percentage";
  book?: Book;
}

export interface Quotation {
  id: number;
  bookshop: Bookshop;
  items: QuotationItem[];
  total_amount: number;
  discount: number;
  expiresAt: string;
  status: "Active" | "Converted";
  createdAt: string;
}

export interface Backup {
  filename: string;
  size: number;
  createdAt: string;
}
