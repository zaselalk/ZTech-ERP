import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface Service {
  id: number;
  code: string | null;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  cost_price: number | null;
  discount: number;
  discount_type: "Fixed" | "Percentage";
  duration: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  code?: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  cost_price?: number;
  discount?: number;
  discount_type?: "Fixed" | "Percentage";
  duration?: number;
  isActive?: boolean;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

export const serviceService = {
  // Get all services
  getServices: async (): Promise<Service[]> => {
    const response = await api.fetch<Service[]>(`${API_URL}/services`);
    return response;
  },

  // Get active services only (for POS)
  getActiveServices: async (): Promise<Service[]> => {
    const response = await api.fetch<Service[]>(`${API_URL}/services/active`);
    return response;
  },

  // Get single service
  getService: async (id: number): Promise<Service> => {
    const response = await api.fetch<Service>(`${API_URL}/services/${id}`);
    return response;
  },

  // Create service
  createService: async (data: CreateServiceData): Promise<Service> => {
    const response = await api.fetch<Service>(`${API_URL}/services`, {
      method: "POST",
      data,
    });
    return response;
  },

  // Update service
  updateService: async (
    id: number,
    data: UpdateServiceData
  ): Promise<Service> => {
    const response = await api.fetch<Service>(`${API_URL}/services/${id}`, {
      method: "PUT",
      data,
    });
    return response;
  },

  // Delete service
  deleteService: async (id: number): Promise<void> => {
    await api.fetch(`${API_URL}/services/${id}`, {
      method: "DELETE",
    });
  },

  // Toggle service active status
  toggleServiceStatus: async (id: number): Promise<Service> => {
    const response = await api.fetch<Service>(
      `${API_URL}/services/${id}/toggle`,
      {
        method: "PATCH",
      }
    );
    return response;
  },
};

export default serviceService;
