export interface User {
  id: number;
  username: string;
  role: "admin" | "staff";
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
  quantity?: number;
  reorder_threshold?: number;
  discount?: number;
  discount_type?: "Fixed" | "Percentage";
  SaleItem?: SaleItem; // present in sale responses
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
