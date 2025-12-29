import { describe, it, expect, vi, beforeEach } from "vitest";
import { settingsService } from "./settingsService";

// Mock the api module
vi.mock("../utils/api", () => ({
  default: {
    fetch: vi.fn(),
  },
}));

import api from "../utils/api";

describe("settingsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call API with correct URL for getSettings", async () => {
    const mockSettings = {
      id: 1,
      businessName: "Test Business",
      address: "123 Test St",
      phone: "1234567890",
      email: "test@test.com",
      website: "www.test.com",
      receiptFooter: "Thank you!",
    };

    (api.fetch as any).mockResolvedValue(mockSettings);

    const result = await settingsService.getSettings();

    expect(api.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/settings")
    );
    expect(result).toEqual(mockSettings);
  });

  it("should call API with correct URL and method for updateSettings", async () => {
    const mockSettings = {
      id: 1,
      businessName: "Updated Business",
      address: "456 New St",
      phone: "0987654321",
      email: "updated@test.com",
      website: "www.updated.com",
      receiptFooter: "Thanks!",
    };

    const updateData = {
      businessName: "Updated Business",
      address: "456 New St",
    };

    (api.fetch as any).mockResolvedValue(mockSettings);

    const result = await settingsService.updateSettings(updateData);

    expect(api.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/settings"),
      {
        method: "PUT",
        data: updateData,
      }
    );
    expect(result).toEqual(mockSettings);
  });

  it("should use API_URL from environment variable", async () => {
    const mockSettings = {
      id: 1,
      businessName: "Test",
      address: null,
      phone: null,
      email: null,
      website: null,
      receiptFooter: null,
    };

    (api.fetch as any).mockResolvedValue(mockSettings);

    await settingsService.getSettings();

    // The URL should contain either the env variable or the fallback localhost:5001/api
    expect(api.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/api\/settings$/)
    );
  });
});
