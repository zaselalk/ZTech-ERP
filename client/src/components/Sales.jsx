import { useState, useEffect } from "react";
import { Table, Typography, message, DatePicker, Select } from "antd";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import api from "../utils/api";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const API_URL = "http://localhost:5001/api";

const Sales = ({ refreshKey }) => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetchSales();
  }, [refreshKey]); // Refetch when the refreshKey changes

  const fetchSales = async () => {
    try {
      const response = await api.fetch(`${API_URL}/sales`);
      const salesData = await response.json();
      setSales(salesData);
      processChartData(salesData);
    } catch (e) {
      message.error("Failed to fetch sales");
    }
  };

  const salesColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Bookshop", dataIndex: ["bookshop", "name"], key: "bookshop" },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val) => `LKR ${parseFloat(val).toFixed(2)}`,
    },
    { title: "Payment", dataIndex: "payment_method", key: "payment_method" },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Title level={2}>Sales History</Title>
      <Table columns={salesColumns} dataSource={sales} rowKey="id" />
    </div>
  );
};

export default Sales;
