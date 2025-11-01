import { useState, useEffect } from "react";
import { Table, DatePicker, Typography, message, Button } from "antd";
import { Link } from "react-router-dom";

import api from "../utils/api";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const API_URL = "http://localhost:5001/api";

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);

  useEffect(() => {
    fetchLowStockReport();
    fetchSalesReport(); // Initial fetch without dates
  }, []);

  const fetchSalesReport = async (dates = null) => {
    try {
      let url = `${API_URL}/reports/sales`;
      if (dates) {
        url += `?startDate=${dates[0].toISOString()}&endDate=${dates[1].toISOString()}`;
      }
      const response = await api.fetch(url);
      setSalesData(await response.json());
    } catch (e) {
      message.error("Failed to fetch sales report");
    }
  };

  const fetchLowStockReport = async () => {
    try {
      const response = await api.fetch(`${API_URL}/reports/low-stock`);
      setLowStockData(await response.json());
    } catch (e) {
      message.error("Failed to fetch low stock report");
    }
  };

  const handleDateChange = (dates) => {
    if (dates) {
      fetchSalesReport(dates);
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
      render: (val) => `$${val}`,
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
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <span>
          <Link to={`/bookshops/`}>
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

      <Title level={3} style={{ marginTop: 32 }}>
        Sales Report
      </Title>
      <RangePicker onChange={handleDateChange} style={{ marginBottom: 16 }} />
      <Table columns={salesColumns} dataSource={salesData} rowKey="id" />

      <Title level={3} style={{ marginTop: 32 }}>
        Low Stock Report
      </Title>
      <Table columns={lowStockColumns} dataSource={lowStockData} rowKey="id" />
    </div>
  );
};

export default Reports;
