import { Row, Typography } from "antd";
import { DashboardStatCards } from "./features/dashboard/DashboardStatCards";
import { DashboardInventoryOverview } from "./features/dashboard/DashboardInventoryOverview";
import { DashboardRecentSales } from "./features/dashboard/DashboardRecentSales";

const { Title, Text } = Typography;

const Dashboard = () => {
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

      <DashboardStatCards />
      <Row gutter={[24, 24]}>
        <DashboardInventoryOverview />
        <DashboardRecentSales />
      </Row>
    </div>
  );
};

export default Dashboard;
