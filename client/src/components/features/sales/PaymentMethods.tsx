import { Card, Col, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { salesService } from "../../../services";
import { ChartOptions } from "chart.js";

interface paymentMethodOverview {
  payment_method: string;
  totalSales: number;
}

const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          return `${context.label}: LKR ${context.parsed}`;
        },
      },
    },
  },
};

export const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<paymentMethodOverview[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getPaymentMethodsOverView();
        setPaymentMethods(data);
      } catch (error) {
        message.error("Error loding daily sales");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const paymentMethodsChartData = {
    labels: paymentMethods.map((method) => method.payment_method),
    datasets: [
      {
        data: paymentMethods.map((method) => method.totalSales),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  return (
    <Col xs={24} lg={8}>
      <Card
        title="Payment Methods"
        className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
      >
        <div className="h-[300px]">
          {isLoading && (
            <div className="flex justify-center items-center h-full text-[#999]">
              <Spin size="large" />
            </div>
          )}

          {!isLoading && paymentMethods.length > 0 && (
            <Doughnut
              data={paymentMethodsChartData}
              options={doughnutOptions}
            />
          )}

          {!isLoading && paymentMethods.length == 0 && (
            <div className="flex justify-center items-center h-full text-[#999]">
              No payment data available
            </div>
          )}
        </div>
      </Card>
    </Col>
  );
};
