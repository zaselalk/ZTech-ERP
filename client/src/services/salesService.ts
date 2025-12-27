import api from "../utils/api";
import { Sale } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface CreateSaleData {
  CustomerId: number;
  payment_method: string;
  items: Array<{
    ProductId: number;
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
  async getSales(startDate?: string, endDate?: string): Promise<Sale[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/sales?${queryString}`
      : `${API_URL}/sales`;

    return await api.fetch<Sale[]>(url);
  },

  /**
   * get daily sales trend
   */
  async getDailySalesTrend(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/sales/daily-sales-trend?${queryString}`
      : `${API_URL}/sales/daily-sales-trend`;

    return await api.fetch<any>(url);
  },

  /**
   * Get payment methods
   */
  async getPaymentMethodsOverView(
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/sales/sales-payment?${queryString}`
      : `${API_URL}/sales/sales-payment`;

    return await api.fetch<any>(url);
  },

  /**
   * Get sales by customer
   */
  async getSalesByCustomer(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/sales/sales-by-customer?${queryString}`
      : `${API_URL}/sales/sales-by-customer`;

    return await api.fetch<any>(url);
  },

  /**
   * Get sales summary
   */
  async getSalesSummary(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/sales/sales-summary?${queryString}`
      : `${API_URL}/sales/sales-summary`;

    return await api.fetch<any>(url);
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
