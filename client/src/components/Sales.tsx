import { useState, useEffect } from "react";
import {
  Table,
  Typography,
  message,
  Row,
  Col,
  Card,
  Button,
  DatePicker,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import { salesService } from "../services";
import { Sale, ChartDataShape } from "../types";
import ReceiptModal from "./ReceiptModal";
import type { ChartOptions } from "chart.js";
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
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatCurrency } from "../utils";
import { DailySalesTrend } from "./features/sales/DailySalesTrend";
import { PaymentMethods } from "./features/sales/PaymentMethods";

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
  ArcElement,
  Filler
);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface SalesProps {
  refreshKey?: number | string;
}

const Sales = ({ refreshKey }: SalesProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [chartData, setChartData] = useState<ChartDataShape>({
    dailySales: [],
    bookshopSales: [],
    paymentMethods: [],
  });
  const [totalSales, setTotalSales] = useState<number>(0);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  useEffect(() => {
    const total = sales.reduce((sum, sale) => {
      const amount =
        typeof sale.total_amount === "number"
          ? sale.total_amount
          : parseFloat(String(sale.total_amount));
      return sum + amount;
    }, 0);
    setTotalSales(total);
  }, [sales]);

  useEffect(() => {
    fetchSales();
  }, [refreshKey, dateRange]); // Refetch when the refreshKey or dateRange changes

  const fetchSales = async (): Promise<void> => {
    try {
      let startStr, endStr;
      if (dateRange && dateRange[0] && dateRange[1]) {
        startStr = dateRange[0].format("YYYY-MM-DD");
        endStr = dateRange[1].format("YYYY-MM-DD");
      }
      const salesData = await salesService.getSales(startStr, endStr);
      setSales(salesData);
      processChartData(salesData);
    } catch (e) {
      const err = e as Error;
      message.error(`Failed to fetch sales: ${err.message}`);
    }
  };

  const processChartData = (salesData: Sale[] = sales): void => {
    if (!salesData || salesData.length === 0) return;

    // Process daily sales for line chart
    const dailySalesMap: Record<string, number> = {};
    const bookshopSalesMap: Record<string, number> = {};
    const paymentMethodsMap: Record<string, number> = {};

    salesData.forEach((sale) => {
      const date = new Date(sale.createdAt).toLocaleDateString();
      const amount =
        typeof sale.total_amount === "number"
          ? sale.total_amount
          : parseFloat(String(sale.total_amount));
      const bookshop = sale.bookshop?.name || "Unknown";
      const paymentMethod = sale.payment_method || "Cash";

      // Daily sales
      dailySalesMap[date] = (dailySalesMap[date] || 0) + amount;

      // Bookshop sales
      bookshopSalesMap[bookshop] = (bookshopSalesMap[bookshop] || 0) + amount;

      // Payment methods
      paymentMethodsMap[paymentMethod] =
        (paymentMethodsMap[paymentMethod] || 0) + amount;
    });

    // Convert to array format for charts
    const dailySales = Object.entries(dailySalesMap)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7); // Last 7 days

    const bookshopSales = Object.entries(bookshopSalesMap);
    const paymentMethods = Object.entries(paymentMethodsMap);

    setChartData({
      dailySales: dailySales as [string, number][],
      bookshopSales: bookshopSales as [string, number][],
      paymentMethods: paymentMethods as [string, number][],
    });
  };

  const handleViewReceipt = (saleId: number) => {
    setSelectedSaleId(saleId);
    setReceiptVisible(true);
  };

  const handleCloseReceipt = () => {
    setReceiptVisible(false);
    setSelectedSaleId(null);
  };

  const salesColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: Sale, b: Sale) => a.id - b.id,
      defaultSortOrder: "descend" as const,
    },
    { title: "Bookshop", dataIndex: ["bookshop", "name"], key: "bookshop" },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: string | number) =>
        `${formatCurrency(typeof val === "number" ? val : parseFloat(val))}`,
    },
    { title: "Payment", dataIndex: "payment_method", key: "payment_method" },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Sale) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewReceipt(record.id)}
        >
          View Receipt
        </Button>
      ),
    },
  ];

  // Chart configurations
  const dailySalesChartData = {
    labels: chartData.dailySales.map(([date]) => date),
    datasets: [
      {
        label: "Daily Sales (LKR)",
        data: chartData.dailySales.map(([, amount]) => amount),
        borderColor: "rgb(102, 126, 234)",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const bookshopSalesChartData = {
    labels: chartData.bookshopSales.map(([name]) => name),
    datasets: [
      {
        label: "Sales by Bookshop (LKR)",
        data: chartData.bookshopSales.map(([, amount]) => amount),
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(6, 214, 160, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(255, 149, 0, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-0">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Title
            level={2}
            className="text-[#2c3e50] mb-2 text-[28px] font-bold"
          >
            Sales Analytics
          </Title>
          <Text className="text-base text-[#7f8c8d]">
            Comprehensive sales data and insights
          </Text>
        </div>
        <div>
          <RangePicker
            onChange={(dates) =>
              setDateRange(dates as [Dayjs | null, Dayjs | null] | null)
            }
            className="w-64"
          />
        </div>
      </div>

      <Row gutter={[24, 24]} className="mb-8">
        <DailySalesTrend />
        <PaymentMethods />
      </Row>

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} lg={12}>
          <Card
            title="Sales by Bookshop"
            className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
          >
            <div className="h-[300px]">
              {chartData.bookshopSales.length > 0 ? (
                <Bar
                  data={bookshopSalesChartData}
                  options={
                    {
                      indexAxis: "y",
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top" },
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value: number | string) =>
                              `LKR ${value}`,
                          },
                        },
                      },
                    } as ChartOptions<"bar">
                  }
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    color: "#999",
                  }}
                >
                  No bookshop data available
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Sales Summary"
            className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
          >
            <div className="h-[300px] overflow-auto">
              {sales.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <Text strong className="text-base">
                      Total Sales
                    </Text>
                    <div className="text-2xl font-bold text-[#667eea] mt-1">
                      {formatCurrency(totalSales)}
                    </div>
                  </div>
                  <div className="mb-4">
                    <Text strong className="text-base">
                      Total Transactions
                    </Text>
                    <div className="text-2xl font-bold text-[#06d6a0] mt-1">
                      {sales.length}
                    </div>
                  </div>
                  <div className="mb-4">
                    <Text strong className="text-base">
                      Average Sale
                    </Text>
                    <div className="text-2xl font-bold text-[#8b5cf6] mt-1">
                      {formatCurrency(totalSales / sales.length)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-full text-[#999]">
                  No sales data available
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sales Table */}
      <Card
        title="Sales History"
        className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
      >
        <Table
          columns={salesColumns}
          dataSource={sales}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      <ReceiptModal
        saleId={selectedSaleId}
        visible={receiptVisible}
        onClose={handleCloseReceipt}
      />
    </div>
  );
};

export default Sales;
