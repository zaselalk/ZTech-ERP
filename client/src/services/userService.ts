import api from "../utils/api";
import { User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const userService = {
  getUsers: async () => {
    return await api.fetch<User[]>(`${API_URL}/users`);
  },

  createUser: async (userData: Partial<User> & { password?: string }) => {
    return await api.fetch<User>(`${API_URL}/users`, {
      method: "POST",
      data: userData,
    });
  },

  updateUser: async (
    id: number,
    userData: Partial<User> & { password?: string }
  ) => {
    return await api.fetch<User>(`${API_URL}/users/${id}`, {
      method: "PUT",
      data: userData,
    });
  },

  deleteUser: async (id: number) => {
    return await api.fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });
  },
};
