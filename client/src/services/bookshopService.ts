import api from "../utils/api";
import { Bookshop, Sale, ConsignmentPayment } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const bookshopService = {
  /**
   * Get all bookshops
   */
  async getBookshops(): Promise<Bookshop[]> {
    return await api.fetch<Bookshop[]>(`${API_URL}/bookshops`);
  },

  /**
   * Get a single bookshop by ID
   */
  async getBookshopById(id: string | number): Promise<Bookshop> {
    return await api.fetch<Bookshop>(`${API_URL}/bookshops/${id}`);
  },

  /**
   * Get sales for a specific bookshop
   */
  async getBookshopSales(id: string | number): Promise<Sale[]> {
    return await api.fetch<Sale[]>(`${API_URL}/bookshops/${id}/sales`);
  },

  /**
   * Create a new bookshop
   */
  async createBookshop(bookshopData: Partial<Bookshop>): Promise<Bookshop> {
    return await api.fetch<Bookshop>(`${API_URL}/bookshops`, {
      method: "POST",
      data: bookshopData,
    });
  },

  /**
   * Update an existing bookshop
   */
  async updateBookshop(
    id: number,
    bookshopData: Partial<Bookshop>
  ): Promise<Bookshop> {
    return await api.fetch<Bookshop>(`${API_URL}/bookshops/${id}`, {
      method: "PUT",
      data: bookshopData,
    });
  },

  /**
   * Delete a bookshop
   */
  async deleteBookshop(id: number): Promise<void> {
    await api.fetch(`${API_URL}/bookshops/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Add a consignment payment
   */
  async addPayment(
    id: string | number,
    data: { amount: number; paymentDate: string; note?: string }
  ): Promise<ConsignmentPayment> {
    return await api.fetch<ConsignmentPayment>(
      `${API_URL}/bookshops/${id}/payments`,
      {
        method: "POST",
        data,
      }
    );
  },

  /**
   * Get consignment payments for a bookshop
   */
  async getPayments(id: string | number): Promise<ConsignmentPayment[]> {
    return await api.fetch<ConsignmentPayment[]>(
      `${API_URL}/bookshops/${id}/payments`
    );
  },
};
