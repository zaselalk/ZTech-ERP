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
  logoUrl: string | null;
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

  uploadLogo: async (
    file: File
  ): Promise<{ logoUrl: string; message: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const response = await api.fetch<{
            logoUrl: string;
            message: string;
          }>(`${API_URL}/settings/logo`, {
            method: "POST",
            data: {
              image: base64,
              imageName: file.name,
            },
          });
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },

  deleteLogo: async (): Promise<{ message: string }> => {
    const response = await api.fetch<{ message: string }>(
      `${API_URL}/settings/logo`,
      {
        method: "DELETE",
      }
    );
    return response;
  },
};
