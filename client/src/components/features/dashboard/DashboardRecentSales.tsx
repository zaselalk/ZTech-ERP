import { Col, Card, Table, message, Typography } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  dashboardService,
  DashboardStats,
} from "../../../services/dashboardService";
import { formatCurrency } from "../../../utils";
const { Text } = Typography;

export const DashboardRecentSales = () => {
  const [stats, setStats] = useState<DashboardStats>({
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

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await dashboardService.getStats();
      setStats(response);
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
      render: (val: number | string) => formatCurrency(val),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <a href={`/sales/${record.id}`} style={{ color: "#667eea" }}>
          View
        </a>
      ),
    },
  ];

  return (
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
  );
};
