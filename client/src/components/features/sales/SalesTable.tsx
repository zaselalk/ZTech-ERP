import { Button, Table, Tag, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { salesService } from "../../../services";
import { Sale } from "../../../types";
import { formatCurrency } from "../../../utils";

interface SalesTableProps {
  onViewReceipt: (saleId: number) => void;
  startDate?: string;
  endDate?: string;
  searchText?: string;
  refreshTrigger?: number;
}

export const SalesTable = ({
  onViewReceipt,
  startDate,
  endDate,
  searchText = "",
  refreshTrigger = 0,
}: SalesTableProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate, refreshTrigger]);

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

  // Filter sales based on search text
  const filteredSales = useMemo(() => {
    if (!searchText.trim()) return sales;

    const searchLower = searchText.toLowerCase();
    return sales.filter((sale) => {
      const customerName = sale.customer?.name?.toLowerCase() || "";
      const paymentMethod = sale.payment_method?.toLowerCase() || "";
      const saleId = sale.id.toString();

      return (
        customerName.includes(searchLower) ||
        paymentMethod.includes(searchLower) ||
        saleId.includes(searchLower)
      );
    });
  }, [sales, searchText]);

  const getPaymentMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "green";
      case "card":
        return "blue";
      case "credit":
        return "orange";
      default:
        return "default";
    }
  };

  const salesColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: Sale, b: Sale) => a.id - b.id,
      defaultSortOrder: "descend" as const,
      width: 80,
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customer",
      render: (name: string) => name || "Walk-in Customer",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: string | number) =>
        formatCurrency(typeof val === "number" ? val : parseFloat(val)),
      sorter: (a: Sale, b: Sale) => {
        const aVal =
          typeof a.total_amount === "number"
            ? a.total_amount
            : parseFloat(a.total_amount as string);
        const bVal =
          typeof b.total_amount === "number"
            ? b.total_amount
            : parseFloat(b.total_amount as string);
        return aVal - bVal;
      },
    },
    {
      title: "Payment",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (method: string) => (
        <Tag color={getPaymentMethodColor(method)}>{method || "N/A"}</Tag>
      ),
      filters: [
        { text: "Cash", value: "Cash" },
        { text: "Card", value: "Card" },
        { text: "Credit", value: "Credit" },
      ],
      onFilter: (value: React.Key | boolean, record: Sale) =>
        record.payment_method === value,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => {
        const date = new Date(val);
        return (
          <span>
            {date.toLocaleDateString()}
            <span className="text-gray-400 ml-2 text-xs">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </span>
        );
      },
      sorter: (a: Sale, b: Sale) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: Sale) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => onViewReceipt(record.id)}
        >
          Receipt
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={salesColumns}
      dataSource={filteredSales}
      rowKey="id"
      loading={isLoading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} sales`,
      }}
      scroll={{ x: 800 }}
      size="middle"
      onRow={(record) => ({
        onClick: () => onViewReceipt(record.id),
        style: { cursor: "pointer" },
      })}
      rowClassName="hover:bg-blue-50 transition-colors"
    />
  );
};
