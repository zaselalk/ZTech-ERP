import { Button, Card, message, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { salesService } from "../../../services";
import { Sale } from "../../../types";
import { formatCurrency } from "../../../utils";

interface SalesHistoryProps {
  onViewReceipt: (saleId: number) => void;
  startDate?: string;
  endDate?: string;
}

export const SalesHistory = ({
  onViewReceipt,
  startDate,
  endDate,
}: SalesHistoryProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate]);

  const fetchSales = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const salesData = await salesService.getSales(startDate, endDate);
      setSales(salesData);
    } catch (e) {
      const err = e as Error;
      message.error(`Failed to fetch sales: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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
        <Button icon={<EyeOutlined />} onClick={() => onViewReceipt(record.id)}>
          View Receipt
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="Sales History"
      className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
    >
      <Table
        columns={salesColumns}
        dataSource={sales}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    </Card>
  );
};
