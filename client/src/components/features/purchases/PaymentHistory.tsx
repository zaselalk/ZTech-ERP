import { Table, Tag, Typography, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SupplierPayment } from "../../../services/purchaseService";
import { formatCurrency } from "../../../utils";
import dayjs from "dayjs";

const { Text } = Typography;

interface PaymentHistoryProps {
  payments: SupplierPayment[];
  loading: boolean;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  loading,
}) => {
  const getMethodColor = (method: string) => {
    switch (method) {
      case "Cash":
        return "green";
      case "Card":
        return "blue";
      case "Bank Transfer":
        return "purple";
      case "Cheque":
        return "orange";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<SupplierPayment> = [
    {
      title: "Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 130,
      render: (amount: number) => (
        <Text strong className="text-green-600">
          {formatCurrency(parseFloat(String(amount)))}
        </Text>
      ),
    },
    {
      title: "Method",
      dataIndex: "payment_method",
      key: "payment_method",
      width: 130,
      render: (method: string) => (
        <Tag color={getMethodColor(method)}>{method}</Tag>
      ),
    },
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference",
      width: 150,
      render: (ref: string | null) => ref || "—",
    },
    {
      title: "For Purchase",
      key: "purchase",
      width: 150,
      render: (_, record) =>
        record.purchase ? (
          <Text>
            {record.purchase.invoiceNumber || `#${record.purchase.id}`}
          </Text>
        ) : (
          <Text className="text-gray-400">General Payment</Text>
        ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (notes: string | null) => notes || "—",
    },
  ];

  if (payments.length === 0 && !loading) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No payments recorded yet"
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={payments}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} payments`,
      }}
      scroll={{ x: "max-content" }}
      size="small"
    />
  );
};

export default PaymentHistory;
