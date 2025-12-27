import { Card, Col, message, Spin } from "antd";
import { ChartOptions } from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { salesService } from "../../../services";

interface CustomerSale {
  CustomerId: number;
  totalSales: string;
  customer: {
    name: string;
  };
}

interface SalesByCustomerProps {
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

export const SalesByCustomer = ({
  startDate,
  endDate,
}: SalesByCustomerProps) => {
  const [customerSales, setCustomerSales] = useState<CustomerSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getSalesByCustomer(startDate, endDate);
        setCustomerSales(data);
      } catch (error) {
        message.error("Error loading customer sales");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [startDate, endDate]);

  const customerSalesChartData = {
    labels: customerSales.map((item) => item.customer?.name || "Unknown"),
    datasets: [
      {
        label: "Sales by Customer (LKR)",
        data: customerSales.map((item) => parseFloat(item.totalSales)),
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
        title="Sales by Customer"
        className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
      >
        <div className="h-[300px]">
          {isLoading && (
            <div className="flex justify-center items-center h-full text-[#999]">
              <Spin size="large" />
            </div>
          )}

          {!isLoading && customerSales.length > 0 && (
            <Bar data={customerSalesChartData} options={chartOptions} />
          )}

          {!isLoading && customerSales.length === 0 && (
            <div className="flex justify-center items-center h-full text-[#999]">
              No customer data available
            </div>
          )}
        </div>
      </Card>
    </Col>
  );
};
