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
  discount?: number; // per item discount value
  discountType?: "Fixed" | "Percentage";
}

export interface Book {
  id: number;
  barcode?: string;
  name: string;
  author?: string;
  price: number;
  quantity?: number;
  consignment?: boolean;
  SaleItem?: SaleItem; // present in sale responses
}

export interface Sale {
  id: number;
  bookshop?: Bookshop;
  books: Book[];
  total_amount: number;
  discount?: number;
  payment_method?: string;
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

export interface Backup {
  filename: string;
  size: number;
  createdAt: string;
}
