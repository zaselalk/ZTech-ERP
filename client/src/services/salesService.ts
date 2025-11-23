import api from "../utils/api";
import { Sale } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface CreateSaleData {
  BookshopId: number;
  payment_method: string;
  items: Array<{
    BookId: number;
    quantity: number;
    discount: number;
    discount_type: "Fixed" | "Percentage";
  }>;
  cartDiscount: {
    type: "Fixed" | "Percentage";
    value: number;
  };
}

export const salesService = {
  /**
   * Get all sales
   */
  async getSales(): Promise<Sale[]> {
    return await api.fetch<Sale[]>(`${API_URL}/sales`);
  },

  /**
   * Get a single sale by ID
   */
  async getSaleById(id: string | number): Promise<Sale> {
    return await api.fetch<Sale>(`${API_URL}/sales/${id}`);
  },

  /**
   * Create a new sale
   */
  async createSale(saleData: CreateSaleData): Promise<Sale> {
    return await api.fetch<Sale>(`${API_URL}/sales`, {
      method: "POST",
      data: saleData,
    });
  },

  /**
   * Send receipt email for a sale
   */
  async sendReceiptEmail(
    saleId: string | number,
    email: string
  ): Promise<void> {
    await api.fetch(`${API_URL}/sales/${saleId}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: { email },
    });
  },
};
