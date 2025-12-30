import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface PurchaseItem {
  id?: number;
  PurchaseId?: number;
  ProductId?: number | null;
  productId?: number | null;
  productName?: string;
  quantity: number;
  unit_cost: number;
  total_cost?: number;
  product?: {
    id: number;
    name: string;
    barcode?: string;
    price?: number;
    quantity?: number;
  };
}

export interface Purchase {
  id: number;
  SupplierId: number;
  invoiceNumber: string | null;
  total_amount: number;
  paid_amount: number;
  payment_status: "Unpaid" | "Partial" | "Paid";
  notes: string | null;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: number;
    name: string;
  };
  items?: PurchaseItem[];
  payments?: SupplierPayment[];
}

export interface SupplierPayment {
  id: number;
  SupplierId: number;
  PurchaseId: number | null;
  amount: number;
  payment_method: "Cash" | "Card" | "Bank Transfer" | "Cheque";
  reference: string | null;
  notes: string | null;
  paymentDate: string;
  createdAt: string;
  purchase?: {
    id: number;
    invoiceNumber: string | null;
    total_amount: number;
  };
}

export interface SupplierBalance {
  supplierId: number;
  supplierName: string;
  totalOwed: number;
  totalPurchases: number;
  totalPaid: number;
  unpaidPurchases: {
    id: number;
    total_amount: number;
    paid_amount: number;
    payment_status: string;
  }[];
}

export interface CreatePurchaseData {
  supplierId: number;
  invoiceNumber?: string;
  items: {
    productId?: number;
    productName?: string;
    quantity: number;
    unit_cost: number;
  }[];
  notes?: string;
  purchaseDate?: string;
  initialPayment?: number;
  paymentMethod?: "Cash" | "Card" | "Bank Transfer" | "Cheque";
  updateInventory?: boolean;
}

export interface CreatePaymentData {
  amount: number;
  paymentMethod?: "Cash" | "Card" | "Bank Transfer" | "Cheque";
  reference?: string;
  notes?: string;
  paymentDate?: string;
  purchaseIds?: number[];
}

export interface PaginatedPurchaseResponse {
  data: Purchase[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const purchaseService = {
  /**
   * Get all purchases with optional filters
   */
  async getPurchases(params?: {
    supplierId?: number;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedPurchaseResponse> {
    const queryParams = new URLSearchParams();
    if (params?.supplierId)
      queryParams.append("supplierId", String(params.supplierId));
    if (params?.paymentStatus)
      queryParams.append("paymentStatus", params.paymentStatus);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));

    const query = queryParams.toString();
    return await api.fetch<PaginatedPurchaseResponse>(
      `${API_URL}/purchases${query ? `?${query}` : ""}`
    );
  },

  /**
   * Get a single purchase by ID
   */
  async getPurchaseById(id: number): Promise<Purchase> {
    return await api.fetch<Purchase>(`${API_URL}/purchases/${id}`);
  },

  /**
   * Create a new purchase
   */
  async createPurchase(data: CreatePurchaseData): Promise<Purchase> {
    return await api.fetch<Purchase>(`${API_URL}/purchases`, {
      method: "POST",
      data,
    });
  },

  /**
   * Update a purchase
   */
  async updatePurchase(
    id: number,
    data: { invoiceNumber?: string; notes?: string; purchaseDate?: string }
  ): Promise<Purchase> {
    return await api.fetch<Purchase>(`${API_URL}/purchases/${id}`, {
      method: "PUT",
      data,
    });
  },

  /**
   * Delete a purchase
   */
  async deletePurchase(id: number): Promise<void> {
    await api.fetch(`${API_URL}/purchases/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Get purchases for a specific supplier
   */
  async getSupplierPurchases(supplierId: number): Promise<Purchase[]> {
    return await api.fetch<Purchase[]>(
      `${API_URL}/purchases/supplier/${supplierId}`
    );
  },

  /**
   * Get supplier balance
   */
  async getSupplierBalance(supplierId: number): Promise<SupplierBalance> {
    return await api.fetch<SupplierBalance>(
      `${API_URL}/purchases/supplier/${supplierId}/balance`
    );
  },

  /**
   * Add payment to a specific purchase
   */
  async addPurchasePayment(
    purchaseId: number,
    data: {
      amount: number;
      paymentMethod?: string;
      reference?: string;
      notes?: string;
      paymentDate?: string;
    }
  ): Promise<{
    payment: SupplierPayment;
    purchase: {
      id: number;
      paid_amount: number;
      payment_status: string;
      remaining: number;
    };
  }> {
    return await api.fetch(`${API_URL}/purchases/${purchaseId}/payments`, {
      method: "POST",
      data,
    });
  },

  /**
   * Get all payments for a supplier
   */
  async getSupplierPayments(supplierId: number): Promise<SupplierPayment[]> {
    return await api.fetch<SupplierPayment[]>(
      `${API_URL}/purchases/supplier/${supplierId}/payments`
    );
  },

  /**
   * Make a general payment to a supplier
   */
  async makeSupplierPayment(
    supplierId: number,
    data: CreatePaymentData
  ): Promise<{
    payment: SupplierPayment;
    appliedTo: { id: number; amountApplied: number; newStatus: string }[];
    unappliedAmount: number;
  }> {
    return await api.fetch(
      `${API_URL}/purchases/supplier/${supplierId}/payments`,
      {
        method: "POST",
        data,
      }
    );
  },
};
