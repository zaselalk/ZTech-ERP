import api from "../utils/api";
import { User, UserPermissions } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const userService = {
  getUsers: async () => {
    return await api.fetch<User[]>(`${API_URL}/users`);
  },

  getDefaultPermissions: async () => {
    return await api.fetch<UserPermissions>(
      `${API_URL}/users/default-permissions`
    );
  },

  createUser: async (
    userData: Partial<User> & {
      password?: string;
      permissions?: UserPermissions;
    }
  ) => {
    return await api.fetch<User>(`${API_URL}/users`, {
      method: "POST",
      data: userData,
    });
  },

  updateUser: async (
    id: number,
    userData: Partial<User> & {
      password?: string;
      permissions?: UserPermissions;
    }
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
