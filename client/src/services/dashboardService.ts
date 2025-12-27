import api from "../utils/api";
import { Sale } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface DashboardStats {
  totalSalesToday: number;
  totalSalesWeek: number;
  totalSalesMonth: number;
  lowStockCount: number;
  totalProducts: number;
  recentSales: Sale[];
  totalCredit: number;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    return await api.fetch<DashboardStats>(`${API_URL}/dashboard/stats`);
  },
};
