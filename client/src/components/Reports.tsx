import { useState } from "react";
import { DatePicker, Typography } from "antd";
import type { Dayjs } from "dayjs";
import ReceiptModal from "./ReceiptModal";
import { SalesReportTable, LowStockTable } from "./features/reports";

const { Title } = Typography;
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

  return (
    <div>
      <Title level={2}>Reports</Title>

      <RangePicker onChange={handleDateChange} className="my-4" />

      <SalesReportTable
        onViewReceipt={handleViewReceipt}
        startDate={startStr}
        endDate={endStr}
      />

      <LowStockTable />

      <ReceiptModal
        saleId={selectedSaleId}
        visible={isReceiptModalVisible}
        onClose={() => setIsReceiptModalVisible(false)}
      />
    </div>
  );
};

export default Reports;
