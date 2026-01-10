import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface ProductVariant {
  id: number;
  ProductId: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  cost_price: number | null;
  quantity: number;
  attributes: Record<string, string> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: number;
    name: string;
    price: number;
    cost_price: number | null;
  };
}

export interface CreateVariantData {
  ProductId: number;
  name: string;
  sku?: string;
  barcode?: string;
  price?: number;
  cost_price?: number;
  quantity?: number;
  attributes?: Record<string, string>;
}

export interface UpdateVariantData {
  name?: string;
  sku?: string;
  barcode?: string;
  price?: number | null;
  cost_price?: number | null;
  quantity?: number;
  attributes?: Record<string, string> | null;
  isActive?: boolean;
}

export const productVariantService = {
  /**
   * Get all variants for a product
   */
  async getVariantsByProduct(
    productId: number,
    includeInactive = false
  ): Promise<ProductVariant[]> {
    const url = `${API_URL}/product-variants/product/${productId}${
      includeInactive ? "?includeInactive=true" : ""
    }`;
    return await api.fetch<ProductVariant[]>(url);
  },

  /**
   * Get a single variant by ID
   */
  async getVariantById(id: number): Promise<ProductVariant> {
    return await api.fetch<ProductVariant>(`${API_URL}/product-variants/${id}`);
  },

  /**
   * Search for a variant by barcode or SKU
   */
  async searchVariant(query: string): Promise<ProductVariant | null> {
    try {
      return await api.fetch<ProductVariant>(
        `${API_URL}/product-variants/search/${encodeURIComponent(query)}`
      );
    } catch {
      return null;
    }
  },

  /**
   * Create a new variant
   */
  async createVariant(data: CreateVariantData): Promise<ProductVariant> {
    return await api.fetch<ProductVariant>(`${API_URL}/product-variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data,
    });
  },

  /**
   * Update an existing variant
   */
  async updateVariant(
    id: number,
    data: UpdateVariantData
  ): Promise<ProductVariant> {
    return await api.fetch<ProductVariant>(
      `${API_URL}/product-variants/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        data,
      }
    );
  },

  /**
   * Update variant stock
   */
  async updateVariantStock(
    id: number,
    quantity?: number,
    adjustment?: number
  ): Promise<ProductVariant> {
    return await api.fetch<ProductVariant>(
      `${API_URL}/product-variants/${id}/stock`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: { quantity, adjustment },
      }
    );
  },

  /**
   * Delete a variant (soft delete)
   */
  async deleteVariant(id: number): Promise<void> {
    await api.fetch(`${API_URL}/product-variants/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Permanently delete a variant
   */
  async permanentlyDeleteVariant(id: number): Promise<void> {
    await api.fetch(`${API_URL}/product-variants/${id}/permanent`, {
      method: "DELETE",
    });
  },
};
