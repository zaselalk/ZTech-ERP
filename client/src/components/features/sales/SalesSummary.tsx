import { Card, Col, message, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { salesService } from "../../../services";
import { formatCurrency } from "../../../utils";

const { Text } = Typography;

interface SalesSummaryData {
  totalSales: string;
  totalTransactions: string;
  averageSale: string;
}

interface SalesSummaryProps {
  startDate?: string;
  endDate?: string;
}

export const SalesSummary = ({ startDate, endDate }: SalesSummaryProps) => {
  const [summaryData, setSummaryData] = useState<SalesSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getSalesSummary(startDate, endDate);
        setSummaryData(data);
      } catch (error) {
        message.error("Error loading sales summary");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [startDate, endDate]);

  return (
    <Col xs={24} lg={12}>
      <Card
        title="Sales Summary"
        className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
      >
        <div className="h-[300px] overflow-auto">
          {isLoading && (
            <div className="flex justify-center items-center h-full text-[#999]">
              <Spin size="large" />
            </div>
          )}

          {!isLoading && summaryData && (
            <div>
              <div className="mb-4">
                <Text strong className="text-base">
                  Total Sales
                </Text>
                <div className="text-2xl font-bold text-[#667eea] mt-1">
                  {formatCurrency(parseFloat(summaryData.totalSales || "0"))}
                </div>
              </div>
              <div className="mb-4">
                <Text strong className="text-base">
                  Total Transactions
                </Text>
                <div className="text-2xl font-bold text-[#06d6a0] mt-1">
                  {summaryData.totalTransactions || "0"}
                </div>
              </div>
              <div className="mb-4">
                <Text strong className="text-base">
                  Average Sale
                </Text>
                <div className="text-2xl font-bold text-[#8b5cf6] mt-1">
                  {formatCurrency(parseFloat(summaryData.averageSale || "0"))}
                </div>
              </div>
            </div>
          )}

          {!isLoading && !summaryData && (
            <div className="flex justify-center items-center h-full text-[#999]">
              No sales data available
            </div>
          )}
        </div>
      </Card>
    </Col>
  );
};
