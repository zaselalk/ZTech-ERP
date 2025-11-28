import { useState, useEffect } from "react";
import { Table, DatePicker, Typography, message, Button, Space } from "antd";
import type { Dayjs } from "dayjs";
import { Sale, Bookshop, Book } from "../types";
import { Link } from "react-router-dom";
import { reportService } from "../services";
import { formatCurrency } from "../utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface LowStockBook extends Book {
  quantity: number;
  reorder_threshold?: number;
  bookshop?: Bookshop;
}

const Reports = () => {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [lowStockData, setLowStockData] = useState<LowStockBook[]>([]);

  useEffect(() => {
    fetchLowStockReport();
    fetchSalesReport(); // Initial fetch without dates
  }, []);

  const fetchSalesReport = async (
    dates: [Dayjs, Dayjs] | null = null
  ): Promise<void> => {
    try {
      let data: Sale[];
      if (dates) {
        data = await reportService.getSalesReport(
          dates[0].toISOString(),
          dates[1].toISOString()
        );
      } else {
        data = await reportService.getSalesReport();
      }
      setSalesData(data);
    } catch {
      message.error("Failed to fetch sales report");
    }
  };

  const fetchLowStockReport = async (): Promise<void> => {
    try {
      const data = await reportService.getLowStockReport();
      setLowStockData(data);
    } catch {
      message.error("Failed to fetch low stock report");
    }
  };

  const handleDateChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
    _dateStrings: [string, string]
  ): void => {
    if (dates && dates[0] && dates[1]) {
      fetchSalesReport([dates[0], dates[1]]);
    } else {
      fetchSalesReport();
    }
  };

  const exportSalesPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 22);

    const tableData = salesData.map((sale) => [
      sale.id,
      sale.bookshop?.name || "N/A",
      formatCurrency(
        typeof sale.total_amount === "number"
          ? sale.total_amount
          : parseFloat(sale.total_amount as string)
      ),
      sale.payment_method || "N/A",
      new Date(sale.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["Sale ID", "Bookshop", "Total Amount", "Payment Method", "Date"]],
      body: tableData,
      startY: 30,
    });

    doc.save("sales_report.pdf");
  };

  const exportSalesExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      salesData.map((sale) => ({
        "Sale ID": sale.id,
        Bookshop: sale.bookshop?.name || "N/A",
        "Total Amount":
          typeof sale.total_amount === "number"
            ? sale.total_amount
            : parseFloat(sale.total_amount as string),
        "Payment Method": sale.payment_method,
        Date: new Date(sale.createdAt).toLocaleString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, "sales_report.xlsx");
  };

  const exportLowStockPDF = () => {
    const doc = new jsPDF();
    doc.text("Low Stock Report", 14, 22);

    const tableData = lowStockData.map((book) => [
      book.name,
      book.bookshop?.name || "N/A",
      book.quantity,
      book.reorder_threshold || 0,
    ]);

    autoTable(doc, {
      head: [["Book Name", "Bookshop", "Quantity", "Reorder Threshold"]],
      body: tableData,
      startY: 30,
    });

    doc.save("low_stock_report.pdf");
  };

  const exportLowStockExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      lowStockData.map((book) => ({
        "Book Name": book.name,
        Bookshop: book.bookshop?.name || "N/A",
        Quantity: book.quantity,
        "Reorder Threshold": book.reorder_threshold || 0,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Low Stock");
    XLSX.writeFile(workbook, "low_stock_report.xlsx");
  };

  const salesColumns = [
    { title: "Sale ID", dataIndex: "id", key: "id" },
    { title: "Bookshop", dataIndex: ["bookshop", "name"], key: "bookshop" },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: number | string) =>
        `${formatCurrency(typeof val === "number" ? val : parseFloat(val))}`,
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Sale) => (
        <span>
          <Link to={`/receipts/${record.id}`}>
            <Button type="link">View Receipt</Button>
          </Link>
        </span>
      ),
    },
  ];

  const lowStockColumns = [
    { title: "Book Name", dataIndex: "name", key: "name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Reorder Threshold",
      dataIndex: "reorder_threshold",
      key: "reorder_threshold",
    },
  ];

  return (
    <div>
      <Title level={2}>Reports</Title>

      <div className="flex justify-between items-center mt-8">
        <Title level={3} className="m-0!">
          Sales Report
        </Title>
        <Space>
          <Button onClick={exportSalesPDF}>Export PDF</Button>
          <Button onClick={exportSalesExcel}>Export Excel</Button>
        </Space>
      </div>
      <RangePicker onChange={handleDateChange} className="my-4" />
      <Table columns={salesColumns} dataSource={salesData} rowKey="id" />

      <div className="flex justify-between items-center mt-8">
        <Title level={3} className="m-0!">
          Low Stock Report
        </Title>
        <Space>
          <Button onClick={exportLowStockPDF}>Export PDF</Button>
          <Button onClick={exportLowStockExcel}>Export Excel</Button>
        </Space>
      </div>
      <Table columns={lowStockColumns} dataSource={lowStockData} rowKey="id" />
    </div>
  );
};

export default Reports;
