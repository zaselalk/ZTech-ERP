import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface Warehouse {
  id: number;
  name: string;
  code: string | null;
  location: string | null;
  address: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  capacity: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseFormData {
  name: string;
  code?: string;
  location?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  notes?: string;
  isActive?: boolean;
}

export const warehouseService = {
  /**
   * Get all warehouses
   */
  async getWarehouses(activeOnly: boolean = false): Promise<Warehouse[]> {
    const params = activeOnly ? "?activeOnly=true" : "";
    return await api.fetch<Warehouse[]>(`${API_URL}/warehouses${params}`);
  },

  /**
   * Get a single warehouse by ID
   */
  async getWarehouseById(id: string | number): Promise<Warehouse> {
    return await api.fetch<Warehouse>(`${API_URL}/warehouses/${id}`);
  },

  /**
   * Create a new warehouse
   */
  async createWarehouse(warehouseData: WarehouseFormData): Promise<Warehouse> {
    return await api.fetch<Warehouse>(`${API_URL}/warehouses`, {
      method: "POST",
      data: warehouseData,
    });
  },

  /**
   * Update an existing warehouse
   */
  async updateWarehouse(
    id: number,
    warehouseData: WarehouseFormData
  ): Promise<Warehouse> {
    return await api.fetch<Warehouse>(`${API_URL}/warehouses/${id}`, {
      method: "PUT",
      data: warehouseData,
    });
  },

  /**
   * Delete a warehouse
   */
  async deleteWarehouse(id: number): Promise<void> {
    await api.fetch(`${API_URL}/warehouses/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Toggle warehouse active status
   */
  async toggleWarehouseActive(id: number): Promise<Warehouse> {
    return await api.fetch<Warehouse>(
      `${API_URL}/warehouses/${id}/toggle-active`,
      {
        method: "PATCH",
      }
    );
  },
};
