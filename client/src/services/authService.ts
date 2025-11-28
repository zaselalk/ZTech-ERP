import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const authService = {
  /**
   * Login user
   */
  async login(
    username: string,
    password: string
  ): Promise<{ token: string; role: string; username: string }> {
    return await api.fetch<{ token: string; role: string; username: string }>(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        data: { username, password },
      }
    );
  },

  /**
   * Store token and user info in localStorage
   */
  storeToken(token: string, role?: string, username?: string): void {
    localStorage.setItem("token", token);
    if (role) localStorage.setItem("role", role);
    if (username) localStorage.setItem("username", username);
  },

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  /**
   * Get user role from localStorage
   */
  getRole(): string | null {
    return localStorage.getItem("role");
  },

  /**
   * Get username from localStorage
   */
  getUsername(): string | null {
    return localStorage.getItem("username");
  },

  /**
   * Remove token and user info from localStorage
   */
  removeToken(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
