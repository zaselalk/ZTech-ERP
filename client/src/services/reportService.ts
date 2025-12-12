import api from "../utils/api";
import { Sale, Book, Bookshop } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface LowStockBook extends Book {
  quantity: number;
  reorder_threshold?: number;
  bookshop?: Bookshop;
}

export const reportService = {
  /**
   * Get sales report with optional date range
   */
  async getSalesReport(startDate?: string, endDate?: string): Promise<Sale[]> {
    let url = `${API_URL}/reports/sales`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return await api.fetch<Sale[]>(url);
  },

  /**
   * Get low stock report
   */
  async getLowStockReport(): Promise<LowStockBook[]> {
    return await api.fetch<LowStockBook[]>(`${API_URL}/reports/low-stock`);
  },
};
