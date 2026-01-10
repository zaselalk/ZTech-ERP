import { describe, it, expect } from "vitest";
import { formatCurrency, formatNumber } from "./utils";

describe("formatCurrency", () => {
  it("should format positive numbers with Rs. prefix", () => {
    expect(formatCurrency(1234.56)).toBe("Rs. 1,234.56");
    expect(formatCurrency(100)).toBe("Rs. 100.00");
    expect(formatCurrency(0.99)).toBe("Rs. 0.99");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("Rs. 0.00");
  });

  it("should format negative numbers", () => {
    expect(formatCurrency(-1234.56)).toBe("Rs. -1,234.56");
  });

  it("should handle string numbers", () => {
    expect(formatCurrency("1234.56")).toBe("Rs. 1,234.56");
    expect(formatCurrency("100")).toBe("Rs. 100.00");
  });

  it("should handle invalid strings as zero", () => {
    expect(formatCurrency("invalid")).toBe("Rs. 0.00");
    expect(formatCurrency("")).toBe("Rs. 0.00");
  });

  it("should format large numbers with thousands separators", () => {
    expect(formatCurrency(1000000)).toBe("Rs. 1,000,000.00");
    expect(formatCurrency(1234567.89)).toBe("Rs. 1,234,567.89");
  });

  it("should round to 2 decimal places", () => {
    expect(formatCurrency(1.234)).toBe("Rs. 1.23");
    expect(formatCurrency(1.235)).toBe("Rs. 1.24");
    expect(formatCurrency(1.999)).toBe("Rs. 2.00");
  });

  it("should handle very small numbers", () => {
    expect(formatCurrency(0.01)).toBe("Rs. 0.01");
    expect(formatCurrency(0.001)).toBe("Rs. 0.00");
  });
});

describe("formatNumber", () => {
  it("should format positive numbers without currency prefix", () => {
    expect(formatNumber(1234.56)).toBe("1,234.56");
    expect(formatNumber(100)).toBe("100.00");
    expect(formatNumber(0.99)).toBe("0.99");
  });

  it("should handle zero", () => {
    expect(formatNumber(0)).toBe("0.00");
  });

  it("should format negative numbers", () => {
    expect(formatNumber(-1234.56)).toBe("-1,234.56");
  });

  it("should handle string numbers", () => {
    expect(formatNumber("1234.56")).toBe("1,234.56");
    expect(formatNumber("100")).toBe("100.00");
  });

  it("should handle invalid strings as zero", () => {
    expect(formatNumber("invalid")).toBe("0.00");
    expect(formatNumber("")).toBe("0.00");
  });

  it("should format large numbers with thousands separators", () => {
    expect(formatNumber(1000000)).toBe("1,000,000.00");
    expect(formatNumber(1234567.89)).toBe("1,234,567.89");
  });

  it("should round to 2 decimal places", () => {
    expect(formatNumber(1.234)).toBe("1.23");
    expect(formatNumber(1.235)).toBe("1.24");
    expect(formatNumber(1.999)).toBe("2.00");
  });

  it("should handle very small numbers", () => {
    expect(formatNumber(0.01)).toBe("0.01");
    expect(formatNumber(0.001)).toBe("0.00");
  });

  it("should match formatCurrency output without Rs. prefix", () => {
    const testValues = [0, 100, 1234.56, -500, 1000000];
    
    testValues.forEach((value) => {
      const currencyFormatted = formatCurrency(value);
      const numberFormatted = formatNumber(value);
      
      expect(currencyFormatted).toBe(`Rs. ${numberFormatted}`);
    });
  });
});
