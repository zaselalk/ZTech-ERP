import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const authService = {
  /**
   * Login user
   */
  async login(username: string, password: string): Promise<{ token: string }> {
    return await api.fetch<{ token: string }>(`${API_URL}/auth/login`, {
      method: "POST",
      data: { username, password },
    });
  },

  /**
   * Store token in localStorage
   */
  storeToken(token: string): void {
    localStorage.setItem("token", token);
  },

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  /**
   * Remove token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem("token");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
