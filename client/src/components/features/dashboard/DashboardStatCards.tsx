import { Card, Col, message, Row, Typography } from "antd";
import { formatCurrency } from "../../../utils";
import {
  DollarCircleOutlined,
  CalendarOutlined,
  RiseOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../../../utils/api";
const API_URL = "http://localhost:5001/api";

const { Title, Text } = Typography;
export const DashboardStatCards = () => {
  const [stats, setStats] = useState({
    totalSalesToday: 0,
    totalSalesWeek: 0,
    totalSalesMonth: 0,
    lowStockCount: 0,
    totalBooks: 0,
    recentSales: [],
    totalConsignment: 0,
  });

  useEffect(() => {
    fetchStats();
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

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
      <Col xs={24} sm={12} md={12} lg={6}>
        <Card
          style={{
            background: "linear-gradient(135deg, #4285f4 0%, #346ecbff 100%)",
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(66, 133, 244, 0.3)",
            color: "white",
            height: "160px",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "12px",
                  display: "block",
                }}
              >
                Today's Sales
              </Text>
              <Title
                level={2}
                style={{
                  color: "white",
                  margin: "8px 0",
                  fontSize: "30px",
                  fontWeight: "700",
                }}
              >
                {formatCurrency(stats.totalSalesToday)}
              </Title>
            </div>
            <CalendarOutlined
              style={{ fontSize: "32px", color: "rgba(255, 255, 255, 0.7)" }}
            />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={12} lg={6}>
        <Card
          style={{
            background: "linear-gradient(135deg, #0f6f56ff 0%, #1a9977ff 100%)",
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(6, 214, 160, 0.3)",
            color: "white",
            height: "160px",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "14px",
                  display: "block",
                }}
              >
                This Week
              </Text>
              <Title
                level={2}
                style={{
                  color: "white",
                  margin: "8px 0",
                  fontSize: "30px",
                  fontWeight: "700",
                }}
              >
                {formatCurrency(stats.totalSalesWeek)}
              </Title>
            </div>
            <RiseOutlined
              style={{ fontSize: "32px", color: "rgba(255,255,255,0.7)" }}
            />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={12} lg={6}>
        <Card
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
            color: "white",
            height: "160px",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "14px",
                  display: "block",
                }}
              >
                This Month
              </Text>
              <Title
                level={2}
                style={{
                  color: "white",
                  margin: "8px 0",
                  fontSize: "30px",
                  fontWeight: "700",
                }}
              >
                {formatCurrency(stats.totalSalesMonth)}
              </Title>
            </div>
            <ShoppingOutlined
              style={{ fontSize: "32px", color: "rgba(255,255,255,0.7)" }}
            />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={12} lg={6}>
        <Card
          style={{
            background: "linear-gradient(135deg, #f54ea2 0%, #ff7676 100%)",
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(245, 78, 162, 0.3)",
            color: "white",
            height: "160px",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "14px",
                  display: "block",
                }}
              >
                Total Consignment
              </Text>
              <Title
                level={2}
                style={{
                  color: "white",
                  margin: "8px 0",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                {formatCurrency(stats.totalConsignment)}
              </Title>
            </div>
            <DollarCircleOutlined
              style={{ fontSize: "32px", color: "rgba(255,255,255,0.7)" }}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};
