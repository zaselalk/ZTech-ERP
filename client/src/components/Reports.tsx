import { useState, useEffect } from "react";
import { Table, DatePicker, Typography, message, Button } from "antd";
import type { Dayjs } from "dayjs";
import { Sale, Bookshop, Book } from "../types";
import { Link } from "react-router-dom";
import { reportService } from "../services";
import { formatCurrency } from "../utils";

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
    { title: "Bookshop", dataIndex: ["bookshop", "name"], key: "bookshop" },
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

      <Title level={3} className="mt-8">
        Sales Report
      </Title>
      <RangePicker onChange={handleDateChange} className="mb-4" />
      <Table columns={salesColumns} dataSource={salesData} rowKey="id" />

      <Title level={3} className="mt-8">
        Low Stock Report
      </Title>
      <Table columns={lowStockColumns} dataSource={lowStockData} rowKey="id" />
    </div>
  );
};

export default Reports;
