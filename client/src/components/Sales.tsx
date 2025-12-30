import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Button,
  DatePicker,
  Tabs,
} from "antd";
import {
  DollarOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  CalendarOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Dayjs } from "dayjs";
import ReceiptModal from "./ReceiptModal";
import { SalesTable } from "./features/sales/SalesTable";
import { SaleReturnsList } from "./features/sales/SaleReturnsList";
import { salesService } from "../services";
import { formatCurrency } from "../utils";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  averageSale: number;
  todaySales: number;
}

const Sales = () => {
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("sales");
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalTransactions: 0,
    averageSale: 0,
    todaySales: 0,
  });

  // Prepare date strings for child components
  let startStr: string | undefined, endStr: string | undefined;
  if (dateRange && dateRange[0] && dateRange[1]) {
    startStr = dateRange[0].format("YYYY-MM-DD");
    endStr = dateRange[1].format("YYYY-MM-DD");
  }

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger, startStr, endStr]);

  const fetchStats = async () => {
    try {
      const summaryData = await salesService.getSalesSummary(startStr, endStr);

      // Get today's sales
      const today = new Date().toISOString().split("T")[0];
      const todaySummary = await salesService.getSalesSummary(today, today);

      setStats({
        totalSales: parseFloat(summaryData.totalSales || "0"),
        totalTransactions: parseInt(summaryData.totalTransactions || "0"),
        averageSale: parseFloat(summaryData.averageSale || "0"),
        todaySales: parseFloat(todaySummary.totalSales || "0"),
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const handleViewReceipt = (saleId: number) => {
    setSelectedSaleId(saleId);
    setReceiptVisible(true);
  };

  const handleCloseReceipt = () => {
    setReceiptVisible(false);
    setSelectedSaleId(null);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={2} className="mb-1! text-2xl! sm:text-3xl!">
            Sales History
          </Title>
          <Text className="text-gray-500">
            View and manage your sales transactions
          </Text>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Sales
                </span>
              }
              value={stats.totalSales}
              prefix={<DollarOutlined className="text-green-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#52c41a", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  Transactions
                </span>
              }
              value={stats.totalTransactions}
              prefix={<ShoppingCartOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1890ff", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  Average Sale
                </span>
              }
              value={stats.averageSale}
              prefix={<PercentageOutlined className="text-purple-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#722ed1", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  Today's Sales
                </span>
              }
              value={stats.todaySales}
              prefix={<CalendarOutlined className="text-orange-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Sales Table Card */}
      <Card
        className="shadow-sm"
        styles={{ body: { padding: "16px sm:24px" } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "sales",
              label: (
                <span>
                  <ShoppingCartOutlined />
                  Sales History
                </span>
              ),
              children: (
                <>
                  {/* Search and Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <Input
                      placeholder="Search sales by customer, payment method..."
                      prefix={<SearchOutlined className="text-gray-400" />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full sm:max-w-md"
                      allowClear
                      size="large"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <RangePicker
                        onChange={(dates) =>
                          setDateRange(
                            dates as [Dayjs | null, Dayjs | null] | null
                          )
                        }
                        className="w-full sm:w-auto"
                        placeholder={["Start Date", "End Date"]}
                      />
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        className="w-full sm:w-auto"
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>

                  <SalesTable
                    onViewReceipt={handleViewReceipt}
                    startDate={startStr}
                    endDate={endStr}
                    searchText={searchText}
                    refreshTrigger={refreshTrigger}
                  />
                </>
              ),
            },
            {
              key: "returns",
              label: (
                <span>
                  <UndoOutlined />
                  Sale Returns
                </span>
              ),
              children: <SaleReturnsList refreshTrigger={refreshTrigger} />,
            },
          ]}
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
