import api from "../utils/api";
import { Book } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface BookStats {
  totalSales: number;
  topBookshops: Array<{
    bookshop: { id: number; name: string };
    total_quantity: number;
    date: string;
  }>;
}

export const bookService = {
  /**
   * Get all books
   */
  async getBooks(): Promise<Book[]> {
    return await api.fetch<Book[]>(`${API_URL}/books`);
  },

  /**
   * Get a single book by ID
   */
  async getBookById(id: string | number): Promise<Book> {
    return await api.fetch<Book>(`${API_URL}/books/${id}`);
  },

  /**
   * Get book statistics
   */
  async getBookStats(id: string | number): Promise<BookStats> {
    return await api.fetch<BookStats>(`${API_URL}/books/${id}/stats`);
  },

  /**
   * Search books by query
   */
  async searchBooks(
    query: string,
    type: "name" | "barcode" = "name"
  ): Promise<Book[]> {
    return await api.fetch<Book[]>(
      `${API_URL}/books?search=${query}&type=${type}`
    );
  },

  /**
   * Get top selling books
   */
  async getTopSellers(): Promise<Book[]> {
    return await api.fetch<Book[]>(`${API_URL}/books/top-sellers`);
  },

  /**
   * Get low stock books
   */
  async getLowStockBooks(): Promise<Book[]> {
    return await api.fetch<Book[]>(`${API_URL}/books/low-stock`);
  },

  /**
   * Create a new book
   */
  async createBook(bookData: Partial<Book>): Promise<Book> {
    return await api.fetch<Book>(`${API_URL}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: bookData,
    });
  },

  /**
   * Update an existing book
   */
  async updateBook(id: number, bookData: Partial<Book>): Promise<Book> {
    return await api.fetch<Book>(`${API_URL}/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      data: bookData,
    });
  },

  /**
   * Delete a book
   */
  async deleteBook(id: number): Promise<void> {
    await api.fetch(`${API_URL}/books/${id}`, {
      method: "DELETE",
    });
  },
};
