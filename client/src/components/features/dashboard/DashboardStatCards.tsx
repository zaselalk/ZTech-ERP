import { Card, Col, message, Row, Typography } from "antd";
import { formatCurrency } from "../../../utils";
import {
  DollarCircleOutlined,
  CalendarOutlined,
  RiseOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  dashboardService,
  DashboardStats,
} from "../../../services/dashboardService";

const { Title, Text } = Typography;
export const DashboardStatCards = () => {
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

  return (
    <Row gutter={[16, 16]} className="mb-12">
      <Col xs={24} sm={12} md={12} lg={6}>
        <Card className="bg-linear-to-br from-[#4285f4] to-[#346ecbff] border-none rounded-2xl shadow-[0_8px_24px_rgba(66,133,244,0.3)] text-white h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-white/80 text-xs block">Today's Sales</Text>
              <Title
                level={2}
                className="text-white my-2 text-[30px] font-bold"
              >
                {formatCurrency(stats.totalSalesToday)}
              </Title>
            </div>
            <CalendarOutlined className="text-[32px] text-white/70" />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={12} lg={6}>
        <Card className="bg-linear-to-br from-[#0f6f56ff] to-[#1a9977ff] border-none rounded-2xl shadow-[0_8px_24px_rgba(6,214,160,0.3)] text-white h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-white/80 text-sm block">This Week</Text>
              <Title
                level={2}
                className="text-white my-2 text-[30px] font-bold"
              >
                {formatCurrency(stats.totalSalesWeek)}
              </Title>
            </div>
            <RiseOutlined className="text-[32px] text-white/70" />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={12} lg={6}>
        <Card className="bg-linear-to-br from-[#8b5cf6] to-[#a855f7] border-none rounded-2xl shadow-[0_8px_24px_rgba(139,92,246,0.3)] text-white h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-white/80 text-sm block">This Month</Text>
              <Title
                level={2}
                className="text-white my-2 text-[30px] font-bold"
              >
                {formatCurrency(stats.totalSalesMonth)}
              </Title>
            </div>
            <ShoppingOutlined className="text-[32px] text-white/70" />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={12} lg={6}>
        <Card className="bg-linear-to-br from-[#f54ea2] to-[#ff7676] border-none rounded-2xl shadow-[0_8px_24px_rgba(245,78,162,0.3)] text-white h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-white/80 text-sm block">
                Total Consignment
              </Text>
              <Title
                level={2}
                className="text-white my-2 text-[32px] font-bold"
              >
                {formatCurrency(stats.totalConsignment)}
              </Title>
            </div>
            <DollarCircleOutlined className="text-[32px] text-white/70" />
          </div>
        </Card>
      </Col>
    </Row>
  );
};
