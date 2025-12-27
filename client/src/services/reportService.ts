import api from "../utils/api";
import { Sale, Product } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface LowStockProduct extends Product {
  quantity: number;
  reorder_threshold?: number;
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
  async getLowStockReport(): Promise<LowStockProduct[]> {
    return await api.fetch<LowStockProduct[]>(`${API_URL}/reports/low-stock`);
  },
};
