import { useState } from "react";
import { Typography, Row, DatePicker } from "antd";
import { Dayjs } from "dayjs";
import ReceiptModal from "./ReceiptModal";
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
import { DailySalesTrend } from "./features/sales/DailySalesTrend";
import { PaymentMethods } from "./features/sales/PaymentMethods";
import { SalesByCustomer } from "./features/sales/SalesByCustomer";
import { SalesSummary } from "./features/sales/SalesSummary";
import { SalesHistory } from "./features/sales/SalesHistory";

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

const Sales = () => {
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  const handleViewReceipt = (saleId: number) => {
    setSelectedSaleId(saleId);
    setReceiptVisible(true);
  };

  const handleCloseReceipt = () => {
    setReceiptVisible(false);
    setSelectedSaleId(null);
  };

  // Prepare date strings for child components
  let startStr, endStr;
  if (dateRange && dateRange[0] && dateRange[1]) {
    startStr = dateRange[0].format("YYYY-MM-DD");
    endStr = dateRange[1].format("YYYY-MM-DD");
  }

  console.log("repeat");

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
        <DailySalesTrend startDate={startStr} endDate={endStr} />
        <PaymentMethods startDate={startStr} endDate={endStr} />
      </Row>

      <Row gutter={[24, 24]} className="mb-8">
        <SalesByCustomer startDate={startStr} endDate={endStr} />
        <SalesSummary startDate={startStr} endDate={endStr} />
      </Row>

      {/* Sales Table */}
      <SalesHistory
        onViewReceipt={handleViewReceipt}
        startDate={startStr}
        endDate={endStr}
      />

      <ReceiptModal
        saleId={selectedSaleId}
        visible={receiptVisible}
        onClose={handleCloseReceipt}
      />
    </div>
  );
};

export default Sales;
