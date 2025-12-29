import { useState } from "react";
import { DatePicker, Typography, Row, Card, Tabs } from "antd";
import {
  LineChartOutlined,
  FileTextOutlined,
  WarningOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
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
import ReceiptModal from "./ReceiptModal";
import {
  SalesReportTable,
  LowStockTable,
  ProfitReportSection,
} from "./features/reports";
import { DailySalesTrend } from "./features/sales/DailySalesTrend";
import { PaymentMethods } from "./features/sales/PaymentMethods";
import { SalesByCustomer } from "./features/sales/SalesByCustomer";
import { SalesSummary } from "./features/sales/SalesSummary";

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

const Reports = () => {
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);

  const handleViewReceipt = (saleId: number) => {
    setSelectedSaleId(saleId);
    setIsReceiptModalVisible(true);
  };

  const handleDateChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
    _dateStrings: [string, string]
  ): void => {
    setDateRange(dates);
  };

  // Prepare date strings for child components
  let startStr, endStr;
  if (dateRange && dateRange[0] && dateRange[1]) {
    startStr = dateRange[0].format("YYYY-MM-DD");
    endStr = dateRange[1].format("YYYY-MM-DD");
  }

  const tabItems = [
    {
      key: "analytics",
      label: (
        <span className="flex items-center gap-2">
          <LineChartOutlined />
          Sales Analytics
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            <DailySalesTrend startDate={startStr} endDate={endStr} />
            <PaymentMethods startDate={startStr} endDate={endStr} />
          </Row>
          <Row gutter={[16, 16]}>
            <SalesByCustomer startDate={startStr} endDate={endStr} />
            <SalesSummary startDate={startStr} endDate={endStr} />
          </Row>
        </div>
      ),
    },
    {
      key: "profit-loss",
      label: (
        <span className="flex items-center gap-2">
          <DollarOutlined />
          Profit & Loss
        </span>
      ),
      children: <ProfitReportSection startDate={startStr} endDate={endStr} />,
    },
    {
      key: "sales-report",
      label: (
        <span className="flex items-center gap-2">
          <FileTextOutlined />
          Sales Report
        </span>
      ),
      children: (
        <SalesReportTable
          onViewReceipt={handleViewReceipt}
          startDate={startStr}
          endDate={endStr}
        />
      ),
    },
    {
      key: "inventory",
      label: (
        <span className="flex items-center gap-2">
          <WarningOutlined />
          Low Stock Alert
        </span>
      ),
      children: <LowStockTable />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={2} className="mb-1! text-2xl! sm:text-3xl!">
            Reports & Analytics
          </Title>
          <Text className="text-gray-500">
            Comprehensive reports and sales analytics
          </Text>
        </div>
        <RangePicker
          onChange={handleDateChange}
          className="w-full sm:w-64"
          size="large"
          placeholder={["Start Date", "End Date"]}
        />
      </div>

      {/* Reports Tabs */}
      <Card className="shadow-sm">
        <Tabs defaultActiveKey="analytics" items={tabItems} size="large" />
      </Card>

      <ReceiptModal
        saleId={selectedSaleId}
        visible={isReceiptModalVisible}
        onClose={() => setIsReceiptModalVisible(false)}
      />
    </div>
  );
};

export default Reports;
