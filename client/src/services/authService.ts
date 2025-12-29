import api from "../utils/api";
import {
  UserPermissions,
  ModuleName,
  ModulePermission,
  DEFAULT_PERMISSIONS,
} from "../types";

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
  ): Promise<{
    token: string;
    username: string;
    permissions: UserPermissions;
  }> {
    return await api.fetch<{
      token: string;
      username: string;
      permissions: UserPermissions;
    }>(`${API_URL}/auth/login`, {
      method: "POST",
      data: { username, password },
    });
  },

  /**
   * Store token and user info in localStorage
   */
  storeToken(
    token: string,
    username?: string,
    permissions?: UserPermissions
  ): void {
    localStorage.setItem("token", token);
    if (username) localStorage.setItem("username", username);
    if (permissions)
      localStorage.setItem("permissions", JSON.stringify(permissions));
  },

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  /**
   * Get username from localStorage
   */
  getUsername(): string | null {
    return localStorage.getItem("username");
  },

  /**
   * Get user permissions from localStorage
   */
  getPermissions(): UserPermissions | null {
    const permissions = localStorage.getItem("permissions");
    if (!permissions) {
      return DEFAULT_PERMISSIONS;
    }
    try {
      return JSON.parse(permissions);
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  },

  /**
   * Check if user has a specific permission for a module
   */
  hasPermission(module: ModuleName, permission: ModulePermission): boolean {
    const permissions = this.getPermissions();
    if (!permissions) return false;
    return permissions[module]?.[permission] ?? false;
  },

  /**
   * Check if user can view a module
   */
  canView(module: ModuleName): boolean {
    return this.hasPermission(module, "view");
  },

  /**
   * Check if user can create in a module
   */
  canCreate(module: ModuleName): boolean {
    return this.hasPermission(module, "create");
  },

  /**
   * Check if user can edit in a module
   */
  canEdit(module: ModuleName): boolean {
    return this.hasPermission(module, "edit");
  },

  /**
   * Check if user can delete in a module
   */
  canDelete(module: ModuleName): boolean {
    return this.hasPermission(module, "delete");
  },

  /**
   * Remove token and user info from localStorage
   */
  removeToken(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("permissions");
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
