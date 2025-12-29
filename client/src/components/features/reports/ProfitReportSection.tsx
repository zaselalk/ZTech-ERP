import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Typography, Spin, Tag } from "antd";
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { Line } from "react-chartjs-2";
import {
  reportService,
  ProfitReport,
  DailyProfitData,
  ProductProfitData,
} from "../../../services/reportService";
import { formatCurrency } from "../../../utils";

const { Title, Text } = Typography;

interface ProfitReportSectionProps {
  startDate?: string;
  endDate?: string;
}

export const ProfitReportSection = ({
  startDate,
  endDate,
}: ProfitReportSectionProps) => {
  const [loading, setLoading] = useState(true);
  const [profitSummary, setProfitSummary] = useState<ProfitReport | null>(null);
  const [dailyProfit, setDailyProfit] = useState<DailyProfitData[]>([]);
  const [productProfit, setProductProfit] = useState<ProductProfitData[]>([]);

  useEffect(() => {
    fetchProfitData();
  }, [startDate, endDate]);

  const fetchProfitData = async () => {
    setLoading(true);
    try {
      const [summary, daily, byProduct] = await Promise.all([
        reportService.getProfitReport(startDate, endDate),
        reportService.getDailyProfitReport(startDate, endDate),
        reportService.getProductProfitReport(startDate, endDate),
      ]);
      setProfitSummary(summary);
      setDailyProfit(daily);
      setProductProfit(byProduct);
    } catch (error) {
      console.error("Failed to fetch profit data", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: dailyProfit.map((d) => d.date),
    datasets: [
      {
        label: "Revenue",
        data: dailyProfit.map((d) => d.revenue),
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Cost",
        data: dailyProfit.map((d) => d.cost),
        borderColor: "#ff4d4f",
        backgroundColor: "rgba(255, 77, 79, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Profit",
        data: dailyProfit.map((d) => d.profit),
        borderColor: "#52c41a",
        backgroundColor: "rgba(82, 196, 26, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Daily Profit Trend",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => formatCurrency(Number(value)),
        },
      },
    },
  };

  const productColumns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
    },
    {
      title: "Qty Sold",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "right" as const,
      sorter: (a: ProductProfitData, b: ProductProfitData) =>
        a.totalQuantity - b.totalQuantity,
    },
    {
      title: "Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right" as const,
      render: (value: number) => formatCurrency(value),
      sorter: (a: ProductProfitData, b: ProductProfitData) =>
        a.totalRevenue - b.totalRevenue,
    },
    {
      title: "Cost",
      dataIndex: "totalCost",
      key: "totalCost",
      align: "right" as const,
      render: (value: number) => formatCurrency(value),
      sorter: (a: ProductProfitData, b: ProductProfitData) =>
        a.totalCost - b.totalCost,
    },
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
      align: "right" as const,
      render: (value: number) => (
        <span style={{ color: value >= 0 ? "#52c41a" : "#ff4d4f" }}>
          {formatCurrency(value)}
        </span>
      ),
      sorter: (a: ProductProfitData, b: ProductProfitData) =>
        a.profit - b.profit,
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Margin",
      dataIndex: "profitMargin",
      key: "profitMargin",
      align: "right" as const,
      render: (value: number) => (
        <Tag color={value >= 20 ? "green" : value >= 10 ? "orange" : "red"}>
          {value.toFixed(1)}%
        </Tag>
      ),
      sorter: (a: ProductProfitData, b: ProductProfitData) =>
        a.profitMargin - b.profitMargin,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  const isProfit = (profitSummary?.grossProfit || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">Total Revenue</span>
              }
              value={profitSummary?.totalRevenue || 0}
              prefix={<DollarOutlined className="text-blue-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#1890ff", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">Total Cost</span>
              }
              value={profitSummary?.totalCost || 0}
              prefix={<ShoppingCartOutlined className="text-orange-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  {isProfit ? "Gross Profit" : "Gross Loss"}
                </span>
              }
              value={Math.abs(profitSummary?.grossProfit || 0)}
              prefix={
                isProfit ? (
                  <RiseOutlined className="text-green-500" />
                ) : (
                  <FallOutlined className="text-red-500" />
                )
              }
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{
                color: isProfit ? "#52c41a" : "#ff4d4f",
                fontWeight: 600,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">Profit Margin</span>
              }
              value={profitSummary?.profitMargin || 0}
              prefix={<PercentageOutlined className="text-purple-500" />}
              suffix="%"
              precision={1}
              valueStyle={{
                color:
                  (profitSummary?.profitMargin || 0) >= 20
                    ? "#52c41a"
                    : (profitSummary?.profitMargin || 0) >= 10
                    ? "#fa8c16"
                    : "#ff4d4f",
                fontWeight: 600,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">Items Sold</span>
              }
              value={profitSummary?.totalItemsSold || 0}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">Transactions</span>
              }
              value={profitSummary?.totalTransactions || 0}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Daily Profit Chart */}
      {dailyProfit.length > 0 && (
        <Card title="Daily Profit Trend" className="shadow-sm">
          <div style={{ height: 300 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card>
      )}

      {/* Product-wise Profit Table */}
      <Card title="Product-wise Profit Analysis" className="shadow-sm">
        <Table
          dataSource={productProfit}
          columns={productColumns}
          rowKey="productName"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
          size="small"
        />
      </Card>
    </div>
  );
};
