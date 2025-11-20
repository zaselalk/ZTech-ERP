import { Card, Col, Divider, message, Table, Typography } from "antd";
import {
  WarningOutlined,
  AppstoreOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../../../utils/api";
const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL;

export const DashboardInventoryOverview = () => {
  const lowStockColumns = [
    { title: "Book Name", dataIndex: "name", key: "name" },
    { title: "Author", dataIndex: "author", key: "author" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  ];

  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

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
            <AlertOutlined style={{ marginRight: "8px", color: "#667eea" }} />
            <span>Low Stock Alert</span>
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
        {lowStockItems.length > 0 && (
          <>
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
                <WarningOutlined
                  style={{ color: "#f39c12", marginRight: "8px" }}
                />
                <Text strong style={{ color: "#f39c12" }}>
                  You're having {lowStockItems.length} Low Stock Alert
                </Text>
              </div>
            </div>

            <Table
              columns={lowStockColumns}
              dataSource={lowStockItems}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </>
        )}

        {lowStockItems.length <= 0 && "You are having ready stock..!"}
      </Card>
    </Col>
  );
};
