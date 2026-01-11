import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "./authService";

// Mock the api module
vi.mock("../utils/api", () => ({
  default: {
    fetch: vi.fn(),
  },
}));

import api from "../utils/api";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("login", () => {
    it("should login successfully and return token and user data", async () => {
      const mockResponse = {
        token: "test-jwt-token",
        username: "admin",
        permissions: {
          products: { view: true, create: true, edit: true, delete: true },
        },
      };

      (api.fetch as any).mockResolvedValue(mockResponse);

      const result = await authService.login("admin", "password123");

      expect(api.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/login"),
        expect.objectContaining({
          method: "POST",
          data: { username: "admin", password: "password123" },
        })
      );
      expect(result).toEqual(mockResponse);
      expect(result.token).toBe("test-jwt-token");
      expect(result.username).toBe("admin");
    });

    it("should throw error on invalid credentials", async () => {
      const mockError = new Error("Invalid credentials");
      (api.fetch as any).mockRejectedValue(mockError);

      await expect(
        authService.login("admin", "wrongpassword")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error on network failure", async () => {
      const mockError = new Error("Network error");
      (api.fetch as any).mockRejectedValue(mockError);

      await expect(authService.login("admin", "password")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("storeToken", () => {
    it("should store token in localStorage", () => {
      authService.storeToken("test-token");
      expect(localStorage.getItem("token")).toBe("test-token");
    });

    it("should store token, username and permissions", () => {
      const permissions = {
        products: { view: true, create: true, edit: false, delete: false },
      };

      authService.storeToken("test-token", "admin", permissions);

      expect(localStorage.getItem("token")).toBe("test-token");
      expect(localStorage.getItem("username")).toBe("admin");
      expect(localStorage.getItem("permissions")).toBe(
        JSON.stringify(permissions)
      );
    });
  });

  describe("getToken", () => {
    it("should return token from localStorage", () => {
      localStorage.setItem("token", "test-token");
      expect(authService.getToken()).toBe("test-token");
    });

    it("should return null if no token exists", () => {
      expect(authService.getToken()).toBeNull();
    });
  });

  describe("getUsername", () => {
    it("should return username from localStorage", () => {
      localStorage.setItem("username", "admin");
      expect(authService.getUsername()).toBe("admin");
    });

    it("should return null if no username exists", () => {
      expect(authService.getUsername()).toBeNull();
    });
  });

  describe("getPermissions", () => {
    it("should return permissions from localStorage", () => {
      const permissions = {
        products: { view: true, create: true, edit: true, delete: true },
      };
      localStorage.setItem("permissions", JSON.stringify(permissions));

      const result = authService.getPermissions();
      expect(result).toEqual(permissions);
    });

    it("should return default permissions if none stored", () => {
      const result = authService.getPermissions();
      expect(result).toBeDefined();
    });

    it("should return default permissions on parse error", () => {
      localStorage.setItem("permissions", "invalid-json");
      const result = authService.getPermissions();
      expect(result).toBeDefined();
    });
  });

  describe("hasPermission", () => {
    beforeEach(() => {
      const permissions = {
        products: { view: true, create: true, edit: false, delete: false },
        sales: { view: true, create: false, edit: false, delete: false },
      };
      localStorage.setItem("permissions", JSON.stringify(permissions));
    });

    it("should return true for allowed permission", () => {
      expect(authService.hasPermission("products", "view")).toBe(true);
      expect(authService.hasPermission("products", "create")).toBe(true);
    });

    it("should return false for denied permission", () => {
      expect(authService.hasPermission("products", "edit")).toBe(false);
      expect(authService.hasPermission("products", "delete")).toBe(false);
    });

    it("should return false for non-existent module", () => {
      expect(authService.hasPermission("nonexistent" as any, "view")).toBe(
        false
      );
    });
  });

  describe("canView, canCreate, canEdit, canDelete", () => {
    beforeEach(() => {
      const permissions = {
        products: { view: true, create: true, edit: false, delete: false },
      };
      localStorage.setItem("permissions", JSON.stringify(permissions));
    });

    it("should check view permission", () => {
      expect(authService.canView("products")).toBe(true);
    });

    it("should check create permission", () => {
      expect(authService.canCreate("products")).toBe(true);
    });

    it("should check edit permission", () => {
      expect(authService.canEdit("products")).toBe(false);
    });

    it("should check delete permission", () => {
      expect(authService.canDelete("products")).toBe(false);
    });
  });

  describe("removeToken", () => {
    it("should remove token, username and permissions from localStorage", () => {
      localStorage.setItem("token", "test-token");
      localStorage.setItem("username", "admin");
      localStorage.setItem("permissions", "{}");

      authService.removeToken();

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("username")).toBeNull();
      expect(localStorage.getItem("permissions")).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when token exists", () => {
      localStorage.setItem("token", "test-token");
      expect(authService.isAuthenticated()).toBe(true);
    });

    it("should return false when no token exists", () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe("isTokenValid", () => {
    it("should return false when no token exists", () => {
      expect(authService.isTokenValid()).toBe(false);
    });

    it("should return false for invalid token format", () => {
      localStorage.setItem("token", "invalid-token");
      expect(authService.isTokenValid()).toBe(false);
    });

    it("should return true for valid non-expired token", () => {
      // Create a token that expires in the future
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTimestamp, id: 1 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;

      localStorage.setItem("token", mockToken);
      expect(authService.isTokenValid()).toBe(true);
    });

    it("should return false for expired token", () => {
      // Create a token that expired in the past
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastTimestamp, id: 1 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;

      localStorage.setItem("token", mockToken);
      expect(authService.isTokenValid()).toBe(false);
    });
  });

  describe("getTokenExpiry", () => {
    it("should return null when no token exists", () => {
      expect(authService.getTokenExpiry()).toBeNull();
    });

    it("should return expiry timestamp in milliseconds", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: futureTimestamp, id: 1 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;

      localStorage.setItem("token", mockToken);
      const expiry = authService.getTokenExpiry();

      expect(expiry).toBe(futureTimestamp * 1000);
    });

    it("should return null for invalid token", () => {
      localStorage.setItem("token", "invalid-token");
      expect(authService.getTokenExpiry()).toBeNull();
    });
  });

  describe("isTokenExpiringSoon", () => {
    it("should return false when no token exists", () => {
      expect(authService.isTokenExpiringSoon()).toBe(false);
    });

    it("should return true when token expires in less than 5 minutes", () => {
      const soonTimestamp = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
      const payload = { exp: soonTimestamp, id: 1 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;

      localStorage.setItem("token", mockToken);
      expect(authService.isTokenExpiringSoon()).toBe(true);
    });

    it("should return false when token expires in more than 5 minutes", () => {
      const laterTimestamp = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
      const payload = { exp: laterTimestamp, id: 1 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;

      localStorage.setItem("token", mockToken);
      expect(authService.isTokenExpiringSoon()).toBe(false);
    });
  });
});
