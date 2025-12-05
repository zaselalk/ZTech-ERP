import { Card, Col, message, Spin } from "antd";
import { ChartOptions } from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { salesService } from "../../../services";

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number | string) => `LKR ${value}`,
      },
    },
  },
};

interface DailySaleItem {
  date: string;
  totalSales: string;
}

interface DailySalesTrendProps {
  startDate?: string;
  endDate?: string;
}

export const DailySalesTrend = ({
  startDate,
  endDate,
}: DailySalesTrendProps) => {
  const [dailySalesTrend, sendDailySalesTrend] = useState<DailySaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getDailySalesTrend(startDate, endDate);
        sendDailySalesTrend(data);
      } catch (error) {
        message.error("Error loding daily sales");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [startDate, endDate]);

  const dailySalesChartData = {
    labels: dailySalesTrend.map((item) => item.date),
    datasets: [
      {
        label: "Daily Sales (LKR)",
        data: dailySalesTrend.map((item) => parseFloat(item.totalSales)),
        borderColor: "rgb(102, 126, 234)",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <Col xs={24} lg={16}>
      <Card
        title="Daily Sales Trend"
        className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
      >
        <div className="h-[300px]">
          {isLoading && (
            <div className="flex justify-center items-center h-full text-[#999]">
              <Spin size="large" />
            </div>
          )}

          {!isLoading && dailySalesTrend.length > 0 && (
            <Line data={dailySalesChartData} options={chartOptions} />
          )}

          {!isLoading && dailySalesTrend.length == 0 && (
            <div className="flex justify-center items-center h-full text-[#999]">
              No sales data available
            </div>
          )}
        </div>
      </Card>
    </Col>
  );
};
