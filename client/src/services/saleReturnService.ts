import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface SaleReturnItem {
  id?: number;
  SaleReturnId?: number;
  SaleItemId: number;
  ProductId?: number | null;
  productName?: string;
  quantity: number;
  price?: number;
  cost_price?: number | null;
  refund_amount?: number;
  reason?: string;
  restockInventory?: boolean;
  product?: {
    id: number;
    name: string;
    barcode?: string;
  };
}

export interface SaleReturn {
  id: number;
  SaleId: number;
  CustomerId: number | null;
  total_amount: number;
  refund_method: "Cash" | "Card" | "Credit" | "Exchange";
  reason: string | null;
  notes: string | null;
  returnDate: string;
  createdAt: string;
  updatedAt: string;
  sale?: {
    id: number;
    total_amount: number;
    payment_method: string;
    createdAt: string;
  };
  customer?: {
    id: number;
    name: string;
  };
  items?: SaleReturnItem[];
}

export interface CreateSaleReturnData {
  saleId: number;
  items: {
    saleItemId: number;
    quantity: number;
    reason?: string;
    restockInventory?: boolean;
  }[];
  refund_method?: "Cash" | "Card" | "Credit" | "Exchange";
  reason?: string;
  notes?: string;
  returnDate?: string;
}

export interface PaginatedSaleReturnResponse {
  data: SaleReturn[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SaleReturnSummary {
  totalReturns: number;
  totalRefunded: number;
  byRefundMethod: {
    refund_method: string;
    count: number;
    total: number;
  }[];
}

export const saleReturnService = {
  /**
   * Get all sale returns with optional filters
   */
  async getSaleReturns(params?: {
    saleId?: number;
    customerId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedSaleReturnResponse> {
    const searchParams = new URLSearchParams();
    if (params?.saleId) searchParams.append("saleId", String(params.saleId));
    if (params?.customerId)
      searchParams.append("customerId", String(params.customerId));
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));

    const queryString = searchParams.toString();
    const url = queryString
      ? `${API_URL}/sale-returns?${queryString}`
      : `${API_URL}/sale-returns`;

    return await api.fetch<PaginatedSaleReturnResponse>(url);
  },

  /**
   * Get a single sale return by ID
   */
  async getSaleReturn(id: number): Promise<SaleReturn> {
    return await api.fetch<SaleReturn>(`${API_URL}/sale-returns/${id}`);
  },

  /**
   * Get returns for a specific sale
   */
  async getReturnsBySale(saleId: number): Promise<SaleReturn[]> {
    return await api.fetch<SaleReturn[]>(
      `${API_URL}/sale-returns/sale/${saleId}`
    );
  },

  /**
   * Create a new sale return
   */
  async createSaleReturn(data: CreateSaleReturnData): Promise<SaleReturn> {
    return await api.fetch<SaleReturn>(`${API_URL}/sale-returns`, {
      method: "POST",
      data,
    });
  },

  /**
   * Update a sale return
   */
  async updateSaleReturn(
    id: number,
    data: { reason?: string; notes?: string }
  ): Promise<SaleReturn> {
    return await api.fetch<SaleReturn>(`${API_URL}/sale-returns/${id}`, {
      method: "PUT",
      data,
    });
  },

  /**
   * Get sale return summary statistics
   */
  async getSaleReturnSummary(params?: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
  }): Promise<SaleReturnSummary> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.customerId)
      searchParams.append("customerId", String(params.customerId));

    const queryString = searchParams.toString();
    const url = queryString
      ? `${API_URL}/sale-returns/summary/stats?${queryString}`
      : `${API_URL}/sale-returns/summary/stats`;

    return await api.fetch<SaleReturnSummary>(url);
  },
};
