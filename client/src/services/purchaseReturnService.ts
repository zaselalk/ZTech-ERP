import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface PurchaseReturnItem {
  id?: number;
  PurchaseReturnId?: number;
  PurchaseItemId: number;
  ProductId?: number | null;
  productName?: string;
  quantity: number;
  unit_cost?: number;
  refund_amount?: number;
  reason?: string;
  updateInventory?: boolean;
  product?: {
    id: number;
    name: string;
    barcode?: string;
  };
}

export interface PurchaseReturn {
  id: number;
  PurchaseId: number;
  SupplierId: number;
  total_amount: number;
  refund_status: "Pending" | "Partial" | "Completed";
  refund_received: number;
  reason: string | null;
  notes: string | null;
  returnDate: string;
  createdAt: string;
  updatedAt: string;
  purchase?: {
    id: number;
    invoiceNumber: string | null;
    total_amount: number;
    purchaseDate: string;
  };
  supplier?: {
    id: number;
    name: string;
  };
  items?: PurchaseReturnItem[];
}

export interface CreatePurchaseReturnData {
  purchaseId: number;
  items: {
    purchaseItemId: number;
    quantity: number;
    reason?: string;
    updateInventory?: boolean;
  }[];
  reason?: string;
  notes?: string;
  returnDate?: string;
  updateInventory?: boolean;
}

export interface PaginatedPurchaseReturnResponse {
  data: PurchaseReturn[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseReturnSummary {
  totalReturns: number;
  totalAmount: number;
  totalRefundReceived: number;
  pendingRefund: number;
  byStatus: {
    refund_status: string;
    count: number;
    total: number;
  }[];
}

export const purchaseReturnService = {
  /**
   * Get all purchase returns with optional filters
   */
  async getPurchaseReturns(params?: {
    purchaseId?: number;
    supplierId?: number;
    refundStatus?: "Pending" | "Partial" | "Completed";
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedPurchaseReturnResponse> {
    const searchParams = new URLSearchParams();
    if (params?.purchaseId)
      searchParams.append("purchaseId", String(params.purchaseId));
    if (params?.supplierId)
      searchParams.append("supplierId", String(params.supplierId));
    if (params?.refundStatus)
      searchParams.append("refundStatus", params.refundStatus);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));

    const queryString = searchParams.toString();
    const url = queryString
      ? `${API_URL}/purchase-returns?${queryString}`
      : `${API_URL}/purchase-returns`;

    return await api.fetch<PaginatedPurchaseReturnResponse>(url);
  },

  /**
   * Get a single purchase return by ID
   */
  async getPurchaseReturn(id: number): Promise<PurchaseReturn> {
    return await api.fetch<PurchaseReturn>(`${API_URL}/purchase-returns/${id}`);
  },

  /**
   * Get returns for a specific purchase
   */
  async getReturnsByPurchase(purchaseId: number): Promise<PurchaseReturn[]> {
    return await api.fetch<PurchaseReturn[]>(
      `${API_URL}/purchase-returns/purchase/${purchaseId}`
    );
  },

  /**
   * Create a new purchase return
   */
  async createPurchaseReturn(
    data: CreatePurchaseReturnData
  ): Promise<PurchaseReturn> {
    return await api.fetch<PurchaseReturn>(`${API_URL}/purchase-returns`, {
      method: "POST",
      data,
    });
  },

  /**
   * Update a purchase return (add refund received or update notes)
   */
  async updatePurchaseReturn(
    id: number,
    data: { refund_received?: number; reason?: string; notes?: string }
  ): Promise<PurchaseReturn> {
    return await api.fetch<PurchaseReturn>(
      `${API_URL}/purchase-returns/${id}`,
      {
        method: "PUT",
        data,
      }
    );
  },

  /**
   * Get purchase return summary statistics
   */
  async getPurchaseReturnSummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<PurchaseReturnSummary> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);

    const queryString = searchParams.toString();
    const url = queryString
      ? `${API_URL}/purchase-returns/summary/stats?${queryString}`
      : `${API_URL}/purchase-returns/summary/stats`;

    return await api.fetch<PurchaseReturnSummary>(url);
  },
};
