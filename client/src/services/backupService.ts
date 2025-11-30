import api from "../utils/api";
import { Backup } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const backupService = {
  getBackups: async (): Promise<Backup[]> => {
    return await api.fetch<Backup[]>(`${API_URL}/backups`);
  },

  createBackup: async (): Promise<{ filename: string; filePath: string }> => {
    return await api.fetch<{ filename: string; filePath: string }>(
      `${API_URL}/backups`,
      { method: "POST" }
    );
  },

  restoreBackup: async (filename: string): Promise<void> => {
    await api.fetch(`${API_URL}/backups/${filename}/restore`, {
      method: "POST",
    });
  },

  deleteBackup: async (filename: string): Promise<void> => {
    await api.fetch(`${API_URL}/backups/${filename}`, { method: "DELETE" });
  },
};
