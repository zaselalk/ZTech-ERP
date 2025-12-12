import api from "../utils/api";
import { Quotation } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const quotationService = {
  getQuotations: async (status?: string): Promise<Quotation[]> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    return api.fetch<Quotation[]>(`${API_URL}/quotations?${params.toString()}`);
  },

  createQuotation: async (data: {
    BookshopId: number;
    items: {
      BookId: number;
      quantity: number;
      discount: number;
      discount_type: "Fixed" | "Percentage";
    }[];
    cartDiscount?: {
      type: "Fixed" | "Percentage";
      value: number;
    };
    expiresAt: string;
  }): Promise<Quotation> => {
    return api.fetch<Quotation>(`${API_URL}/quotations`, {
      method: "POST",
      data: JSON.stringify(data),
    });
  },

  convertQuotation: async (
    id: number,
    payment_method: string
  ): Promise<any> => {
    return api.fetch(`${API_URL}/quotations/${id}/convert`, {
      method: "POST",
      data: JSON.stringify({ payment_method }),
    });
  },
};
