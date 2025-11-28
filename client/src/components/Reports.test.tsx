import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Reports from "./Reports";
import { reportService } from "../services";
import { BrowserRouter } from "react-router-dom";

// Mock dependencies
vi.mock("../services", () => ({
  reportService: {
    getSalesReport: vi.fn(),
    getLowStockReport: vi.fn(),
  },
}));

vi.mock("jspdf", () => {
  return {
    default: class {
      text = vi.fn();
      save = vi.fn();
    },
  };
});

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

// Mock Ant Design components that might cause issues
vi.mock("antd", async () => {
  const antd = await vi.importActual("antd");
  return {
    ...antd,
    DatePicker: {
      RangePicker: () => <div data-testid="range-picker" />,
    },
  };
});

describe("Reports Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (reportService.getSalesReport as any).mockResolvedValue([
      {
        id: 1,
        bookshop: { name: "Shop A" },
        total_amount: 100,
        payment_method: "Cash",
        createdAt: "2023-01-01T10:00:00Z",
      },
    ]);
    (reportService.getLowStockReport as any).mockResolvedValue([
      {
        id: 1,
        name: "Book A",
        bookshop: { name: "Shop A" },
        quantity: 5,
        reorder_threshold: 10,
      },
    ]);
  });

  it("renders report titles and export buttons", async () => {
    render(
      <BrowserRouter>
        <Reports />
      </BrowserRouter>
    );

    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Sales Report")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Report")).toBeInTheDocument();

    const exportButtons = screen.getAllByText(/Export (PDF|Excel)/);
    expect(exportButtons).toHaveLength(4); // 2 for Sales, 2 for Low Stock
  });

  it("calls export functions when buttons are clicked", async () => {
    render(
      <BrowserRouter>
        <Reports />
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(reportService.getSalesReport).toHaveBeenCalled();
    });

    const pdfButtons = screen.getAllByText("Export PDF");
    fireEvent.click(pdfButtons[0]); // Sales PDF

    // Since we mocked jsPDF, we can't easily check if save was called on the instance without more complex mocking,
    // but we can check if the button is clickable and doesn't crash.

    const excelButtons = screen.getAllByText("Export Excel");
    fireEvent.click(excelButtons[0]); // Sales Excel

    // Check if xlsx.writeFile was called
    const XLSX = await import("xlsx");
    expect(XLSX.writeFile).toHaveBeenCalled();
  });
});
