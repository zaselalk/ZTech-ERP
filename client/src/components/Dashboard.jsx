import { useState, useEffect } from "react";
import { Row, Col, Card, Table, Typography, message, Divider } from "antd";
import {
  DollarCircleOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  CalendarOutlined,
  RiseOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const API_URL = "http://localhost:5001/api";

const Dashboard = () => {
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
  }, []); // Refetch when refreshKey changes

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      message.error("Failed to fetch dashboard stats");
    }
  };

  const recentSalesColumns = [
    { title: "Sale ID", dataIndex: "id", key: "id" },
    { title: "Bookshop", dataIndex: ["bookshop", "name"], key: "bookshop" },
    {
      title: "Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val) => `LKR ${val}`,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: "0px" }}>
      <div
        style={{
          marginBottom: "32px",
          background: "transparent",
        }}
      >
        <Title
          level={2}
          style={{
            color: "#2c3e50",
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Welcome back, !
        </Title>
        <Text
          style={{
            fontSize: "16px",
            color: "#7f8c8d",
            display: "block",
          }}
        >
          Here's what's happening with your bookshop today.
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
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
                    fontSize: "14px",
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
                    fontSize: "32px",
                    fontWeight: "700",
                  }}
                >
                  ${stats.totalSalesToday.toFixed(2)}
                </Title>
              </div>
              <CalendarOutlined
                style={{ fontSize: "32px", color: "rgba(255,255,255,0.7)" }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #06d6a0 0%, #118ab2 100%)",
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
                    fontSize: "32px",
                    fontWeight: "700",
                  }}
                >
                  ${stats.totalSalesWeek.toFixed(2)}
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
                    fontSize: "32px",
                    fontWeight: "700",
                  }}
                >
                  ${stats.totalSalesMonth.toFixed(2)}
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
              background: "linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(255, 149, 0, 0.3)",
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
                  Low Stock Items
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
                  {stats.lowStockCount}
                </Title>
              </div>
              <WarningOutlined
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
                  ${stats.totalConsignment.toFixed(2)}
                </Title>
              </div>
              <DollarCircleOutlined
                style={{ fontSize: "32px", color: "rgba(255,255,255,0.7)" }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
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
            <Text style={{ color: "#666", fontSize: "14px" }}>
              Current stock status
            </Text>
            <div style={{ marginTop: "16px" }}>
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
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <WarningOutlined
                    style={{ color: "#f39c12", marginRight: "8px" }}
                  />
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
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <ShoppingOutlined
                  style={{ marginRight: "8px", color: "#667eea" }}
                />
                <span>Recent Sales</span>
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
            <Text style={{ color: "#666", fontSize: "14px" }}>
              Latest transactions
            </Text>
            <div style={{ marginTop: "16px" }}>
              {stats.recentSales?.length > 0 ? (
                <Table
                  columns={recentSalesColumns}
                  dataSource={stats.recentSales}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  style={{
                    background: "transparent",
                  }}
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#999",
                  }}
                >
                  <ShoppingOutlined
                    style={{
                      fontSize: "48px",
                      color: "#ddd",
                      marginBottom: "16px",
                    }}
                  />
                  <div>No recent sales</div>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
