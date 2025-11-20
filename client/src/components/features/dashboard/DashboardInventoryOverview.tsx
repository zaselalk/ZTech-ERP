import { Card, Col, Divider, message, Table, Typography } from "antd";
import { WarningOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../../../utils/api";
const { Title, Text } = Typography;
const API_URL = "http://localhost:5001/api";

export const DashboardInventoryOverview = () => {
  const lowStockColumns = [
    { title: "Book Name", dataIndex: "name", key: "name" },
    { title: "Author", dataIndex: "author", key: "author" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  ];

  const [stats, setStats] = useState({
    totalSalesToday: 0,
    totalSalesWeek: 0,
    totalSalesMonth: 0,
    lowStockCount: 0,
    totalBooks: 0,
    recentSales: [],
    totalConsignment: 0,
  });

  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchLowStockItems();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.fetch(`${API_URL}/dashboard/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      message.error("Failed to fetch dashboard stats");
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await api.fetch(`${API_URL}/books/low-stock`);
      const data = await response.json();
      setLowStockItems(data);
    } catch (error) {
      message.error("Failed to fetch low stock items");
    }
  };

  return (
    <Col xs={24} lg={12}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <AppstoreOutlined
              style={{ marginRight: "8px", color: "#667eea" }}
            />
            <span>Inventory Overview</span>
          </div>
        }
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: "none",
        }}
        headStyle={{
          borderBottom: "1px solid #f0f0f0",
          padding: "16px 24px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <Text strong style={{ fontSize: "16px" }}>
            Total Books
          </Text>
          <Title level={3} style={{ margin: 0, color: "#2c3e50" }}>
            {stats.totalBooks}
          </Title>
        </div>
        <Divider style={{ margin: "16px 0" }} />
        <div
          style={{
            padding: "16px",
            background: "#fff3cd",
            borderRadius: "8px",
            border: "1px solid #ffeaa7",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <WarningOutlined style={{ color: "#f39c12", marginRight: "8px" }} />
            <Text strong style={{ color: "#f39c12" }}>
              Low Stock Alert
            </Text>
          </div>
          <Text
            style={{
              color: "#e17055",
              fontSize: "24px",
              fontWeight: "bold",
              display: "block",
              marginTop: "4px",
            }}
          >
            {stats.lowStockCount}
          </Text>
        </div>
        <Table
          columns={lowStockColumns}
          dataSource={lowStockItems}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </Col>
  );
};
