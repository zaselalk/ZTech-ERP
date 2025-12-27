import api from "../utils/api";
import { Customer, Sale, ConsignmentPayment } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const customerService = {
  /**
   * Get all customers
   */
  async getCustomers(): Promise<Customer[]> {
    return await api.fetch<Customer[]>(`${API_URL}/customers`);
  },

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: string | number): Promise<Customer> {
    return await api.fetch<Customer>(`${API_URL}/customers/${id}`);
  },

  /**
   * Get sales for a specific customer
   */
  async getCustomerSales(id: string | number): Promise<Sale[]> {
    return await api.fetch<Sale[]>(`${API_URL}/customers/${id}/sales`);
  },

  /**
   * Create a new customer
   */
  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    return await api.fetch<Customer>(`${API_URL}/customers`, {
      method: "POST",
      data: customerData,
    });
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(
    id: number,
    customerData: Partial<Customer>
  ): Promise<Customer> {
    return await api.fetch<Customer>(`${API_URL}/customers/${id}`, {
      method: "PUT",
      data: customerData,
    });
  },

  /**
   * Delete a customer
   */
  async deleteCustomer(id: number): Promise<void> {
    await api.fetch(`${API_URL}/customers/${id}`, {
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
      `${API_URL}/customers/${id}/payments`,
      {
        method: "POST",
        data,
      }
    );
  },

  /**
   * Get consignment payments for a customer
   */
  async getPayments(id: string | number): Promise<ConsignmentPayment[]> {
    return await api.fetch<ConsignmentPayment[]>(
      `${API_URL}/customers/${id}/payments`
    );
  },
};
