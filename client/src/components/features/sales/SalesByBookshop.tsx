import { Card, Col, message, Spin } from "antd";
import { ChartOptions } from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { salesService } from "../../../services";

interface BookshopSale {
  BookshopId: number;
  totalSales: string;
  bookshop: {
    name: string;
  };
}

interface SalesByBookshopProps {
  startDate?: string;
  endDate?: string;
}

const chartOptions: ChartOptions<"bar"> = {
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
        callback: (value: number | string) => `LKR ${value}`,
      },
    },
  },
};

export const SalesByBookshop = ({
  startDate,
  endDate,
}: SalesByBookshopProps) => {
  const [bookshopSales, setBookshopSales] = useState<BookshopSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getSalesByBookshop(startDate, endDate);
        setBookshopSales(data);
      } catch (error) {
        message.error("Error loading bookshop sales");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [startDate, endDate]);

  const bookshopSalesChartData = {
    labels: bookshopSales.map((item) => item.bookshop?.name || "Unknown"),
    datasets: [
      {
        label: "Sales by Bookshop (LKR)",
        data: bookshopSales.map((item) => parseFloat(item.totalSales)),
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
    <Col xs={24} lg={12}>
      <Card
        title="Sales by Bookshop"
        className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
      >
        <div className="h-[300px]">
          {isLoading && (
            <div className="flex justify-center items-center h-full text-[#999]">
              <Spin size="large" />
            </div>
          )}

          {!isLoading && bookshopSales.length > 0 && (
            <Bar data={bookshopSalesChartData} options={chartOptions} />
          )}

          {!isLoading && bookshopSales.length === 0 && (
            <div className="flex justify-center items-center h-full text-[#999]">
              No bookshop data available
            </div>
          )}
        </div>
      </Card>
    </Col>
  );
};
