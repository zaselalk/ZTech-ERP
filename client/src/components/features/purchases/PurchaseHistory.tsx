import { useState } from "react";
import {
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Tooltip,
  Modal,
  message,
  Empty,
} from "antd";
import {
  EyeOutlined,
  DollarOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Purchase, purchaseService } from "../../../services/purchaseService";
import { formatCurrency } from "../../../utils";
import dayjs from "dayjs";

const { Text } = Typography;
const { confirm } = Modal;

interface PurchaseHistoryProps {
  purchases: Purchase[];
  loading: boolean;
  onRefresh: () => void;
  onAddPayment: (purchase: Purchase) => void;
  onViewDetails: (purchase: Purchase) => void;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({
  purchases,
  loading,
  onRefresh,
  onAddPayment,
  onViewDetails,
}) => {
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = (purchase: Purchase) => {
    confirm({
      title: "Delete Purchase",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete this purchase${
        purchase.invoiceNumber ? ` (${purchase.invoiceNumber})` : ""
      }? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      async onOk() {
        try {
          setDeleting(purchase.id);
          await purchaseService.deletePurchase(purchase.id);
          message.success("Purchase deleted successfully");
          onRefresh();
        } catch (error: any) {
          message.error(error.message || "Failed to delete purchase");
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Partial":
        return "warning";
      case "Unpaid":
        return "error";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Purchase> = [
    {
      title: "Invoice",
      key: "invoice",
      width: 120,
      render: (_, record) => (
        <Text strong>{record.invoiceNumber || `#${record.id}`}</Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        dayjs(a.purchaseDate).unix() - dayjs(b.purchaseDate).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Items",
      key: "items",
      width: 80,
      render: (_, record) => (
        <Tag color="blue">{record.items?.length || 0} items</Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      width: 130,
      render: (amount: number) => (
        <Text strong>{formatCurrency(parseFloat(String(amount)))}</Text>
      ),
      sorter: (a, b) =>
        parseFloat(String(a.total_amount)) - parseFloat(String(b.total_amount)),
    },
    {
      title: "Paid",
      dataIndex: "paid_amount",
      key: "paid_amount",
      width: 130,
      render: (amount: number) => (
        <Text className="text-green-600">
          {formatCurrency(parseFloat(String(amount)))}
        </Text>
      ),
    },
    {
      title: "Balance",
      key: "balance",
      width: 130,
      render: (_, record) => {
        const balance =
          parseFloat(String(record.total_amount)) -
          parseFloat(String(record.paid_amount));
        return (
          <Text type={balance > 0 ? "danger" : "success"}>
            {formatCurrency(balance)}
          </Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "payment_status",
      key: "payment_status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: "Paid", value: "Paid" },
        { text: "Partial", value: "Partial" },
        { text: "Unpaid", value: "Unpaid" },
      ],
      onFilter: (value, record) => record.payment_status === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewDetails(record)}
            />
          </Tooltip>
          {record.payment_status !== "Paid" && (
            <Tooltip title="Add Payment">
              <Button
                type="text"
                icon={<DollarOutlined />}
                className="text-green-600"
                onClick={() => onAddPayment(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleting === record.id}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (purchases.length === 0 && !loading) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No purchases yet"
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={purchases}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} purchases`,
      }}
      scroll={{ x: "max-content" }}
      size="small"
    />
  );
};

export default PurchaseHistory;
