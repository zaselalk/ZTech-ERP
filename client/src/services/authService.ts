import api from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/**
 * Decode JWT token payload without verification
 * Used for extracting expiry information
 */
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

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

  /**
   * Check if the current token is valid (not expired)
   * Returns false if no token, invalid token, or expired token
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return false;

    // Check if token has expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  },

  /**
   * Get token expiry time in milliseconds
   * Returns null if token is invalid or missing
   */
  getTokenExpiry(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return null;

    return payload.exp * 1000; // Convert to milliseconds
  },

  /**
   * Check if token will expire soon (within 5 minutes)
   * Useful for implementing token refresh logic
   */
  isTokenExpiringSoon(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;

    const fiveMinutes = 5 * 60 * 1000;
    return expiry - Date.now() < fiveMinutes;
  },
};
