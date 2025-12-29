import api from "../utils/api";
import { Sale, Product } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface LowStockProduct extends Product {
  quantity: number;
  reorder_threshold?: number;
}

export interface ProfitReport {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  totalItemsSold: number;
  totalTransactions: number;
}

export interface DailyProfitData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ProductProfitData {
  productName: string;
  productId: number | null;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
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

  /**
   * Get profit/loss summary report
   */
  async getProfitReport(
    startDate?: string,
    endDate?: string
  ): Promise<ProfitReport> {
    let url = `${API_URL}/reports/profit`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return await api.fetch<ProfitReport>(url);
  },

  /**
   * Get daily profit trend
   */
  async getDailyProfitReport(
    startDate?: string,
    endDate?: string
  ): Promise<DailyProfitData[]> {
    let url = `${API_URL}/reports/profit/daily`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return await api.fetch<DailyProfitData[]>(url);
  },

  /**
   * Get product-wise profit report
   */
  async getProductProfitReport(
    startDate?: string,
    endDate?: string
  ): Promise<ProductProfitData[]> {
    let url = `${API_URL}/reports/profit/by-product`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return await api.fetch<ProductProfitData[]>(url);
  },
};
