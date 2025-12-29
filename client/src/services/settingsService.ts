import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface Settings {
  id: number;
  businessName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  receiptFooter: string | null;
}

export const settingsService = {
  getSettings: async (): Promise<Settings> => {
    const response = await api.fetch<Settings>(`${API_URL}/settings`);
    return response;
  },

  updateSettings: async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await api.fetch<Settings>(`${API_URL}/settings`, {
      method: "PUT",
      data: settings,
    });
    return response;
  },
};
