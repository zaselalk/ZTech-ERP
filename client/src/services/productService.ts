import api from "../utils/api";
import { Product, Sale } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface ProductStats {
  totalSold: number;
  totalRevenue: number;
  sales: any[]; // Define better type if needed
}

export const productService = {
  /**
   * Get all products
   */
  async getProducts(): Promise<Product[]> {
    return await api.fetch<Product[]>(`${API_URL}/products`);
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string | number): Promise<Product> {
    return await api.fetch<Product>(`${API_URL}/products/${id}`);
  },

  /**
   * Get product statistics
   */
  async getProductStats(id: string | number): Promise<ProductStats> {
    return await api.fetch<ProductStats>(`${API_URL}/products/${id}/stats`);
  },

  /**
   * Search products by query
   */
  async searchProducts(
    query: string,
    type: "name" | "barcode" = "name"
  ): Promise<Product[]> {
    return await api.fetch<Product[]>(
      `${API_URL}/products?search=${query}&type=${type}`
    );
  },

  /**
   * Get top selling products
   */
  async getTopSellers(): Promise<Product[]> {
    return await api.fetch<Product[]>(`${API_URL}/products/top-sellers`);
  },

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<Product[]> {
    return await api.fetch<Product[]>(`${API_URL}/products/low-stock`);
  },

  /**
   * Create a new product
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    return await api.fetch<Product>(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: productData,
    });
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    id: number,
    productData: Partial<Product>
  ): Promise<Product> {
    return await api.fetch<Product>(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      data: productData,
    });
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    await api.fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
    });
  },
};
