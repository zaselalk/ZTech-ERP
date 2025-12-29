import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFormData {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export const supplierService = {
  /**
   * Get all suppliers
   */
  async getSuppliers(): Promise<Supplier[]> {
    return await api.fetch<Supplier[]>(`${API_URL}/suppliers`);
  },

  /**
   * Get a single supplier by ID
   */
  async getSupplierById(id: string | number): Promise<Supplier> {
    return await api.fetch<Supplier>(`${API_URL}/suppliers/${id}`);
  },

  /**
   * Create a new supplier
   */
  async createSupplier(supplierData: SupplierFormData): Promise<Supplier> {
    return await api.fetch<Supplier>(`${API_URL}/suppliers`, {
      method: "POST",
      data: supplierData,
    });
  },

  /**
   * Update an existing supplier
   */
  async updateSupplier(
    id: number,
    supplierData: SupplierFormData
  ): Promise<Supplier> {
    return await api.fetch<Supplier>(`${API_URL}/suppliers/${id}`, {
      method: "PUT",
      data: supplierData,
    });
  },

  /**
   * Delete a supplier
   */
  async deleteSupplier(id: number): Promise<void> {
    await api.fetch(`${API_URL}/suppliers/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Get all products for a supplier
   */
  async getSupplierProducts(supplierId: string | number): Promise<
    {
      id: number;
      name: string;
      code: string;
      category: string;
      quantity: number;
      price: number;
      buyPrice: number | null;
    }[]
  > {
    return await api.fetch(`${API_URL}/suppliers/${supplierId}/products`);
  },
};
