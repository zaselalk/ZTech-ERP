import api from "../utils/api";

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
    const response = await api.fetch<Settings>("/settings");
    return response;
  },

  updateSettings: async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await api.fetch<Settings>("/settings", {
      method: "PUT",
      data: settings,
    });
    return response;
  },
};
