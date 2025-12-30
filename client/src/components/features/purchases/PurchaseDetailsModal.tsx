import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Typography,
  Divider,
  Space,
} from "antd";
import {
  ShoppingCartOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Purchase, PurchaseItem } from "../../../services/purchaseService";
import { formatCurrency } from "../../../utils";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface PurchaseDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

const PurchaseDetailsModal: React.FC<PurchaseDetailsModalProps> = ({
  visible,
  onClose,
  purchase,
}) => {
  if (!purchase) return null;

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

  const itemColumns: ColumnsType<PurchaseItem> = [
    {
      title: "Product",
      key: "product",
      render: (_, record) => (
        <div>
          <Text strong>
            {record.product?.name || record.productName || "Unknown"}
          </Text>
          {record.product?.barcode && (
            <Text className="text-gray-400 block text-xs">
              {record.product.barcode}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
    },
    {
      title: "Unit Cost",
      dataIndex: "unit_cost",
      key: "unit_cost",
      width: 130,
      align: "right",
      render: (value: number) => formatCurrency(parseFloat(String(value))),
    },
    {
      title: "Total",
      dataIndex: "total_cost",
      key: "total_cost",
      width: 130,
      align: "right",
      render: (value: number) => (
        <Text strong>{formatCurrency(parseFloat(String(value)))}</Text>
      ),
    },
  ];

  const balance =
    parseFloat(String(purchase.total_amount)) -
    parseFloat(String(purchase.paid_amount));

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>
            Purchase Details - {purchase.invoiceNumber || `#${purchase.id}`}
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
        <Descriptions.Item
          label={
            <Space>
              <FileTextOutlined /> Invoice
            </Space>
          }
        >
          {purchase.invoiceNumber || `#${purchase.id}`}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CalendarOutlined /> Date
            </Space>
          }
        >
          {dayjs(purchase.purchaseDate).format("DD MMMM YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Supplier">
          {purchase.supplier?.name || "Unknown"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(purchase.payment_status)}>
            {purchase.payment_status}
          </Tag>
        </Descriptions.Item>
        {purchase.notes && (
          <Descriptions.Item label="Notes" span={2}>
            {purchase.notes}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider>Items</Divider>

      <Table
        columns={itemColumns}
        dataSource={purchase.items || []}
        rowKey="id"
        pagination={false}
        size="small"
      />

      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <Text>Total Amount:</Text>
          <Title level={4} className="m-0!">
            {formatCurrency(parseFloat(String(purchase.total_amount)))}
          </Title>
        </div>
        <div className="flex justify-between items-center mb-2">
          <Text>Paid Amount:</Text>
          <Text className="text-green-600 font-semibold">
            {formatCurrency(parseFloat(String(purchase.paid_amount)))}
          </Text>
        </div>
        <Divider className="my-2!" />
        <div className="flex justify-between items-center">
          <Text strong>Balance Due:</Text>
          <Text
            strong
            className={balance > 0 ? "text-red-600" : "text-green-600"}
          >
            {formatCurrency(balance)}
          </Text>
        </div>
      </div>

      {purchase.payments && purchase.payments.length > 0 && (
        <>
          <Divider>Payment History</Divider>
          <Table
            columns={[
              {
                title: "Date",
                dataIndex: "paymentDate",
                render: (d: string) => dayjs(d).format("DD/MM/YYYY"),
              },
              {
                title: "Amount",
                dataIndex: "amount",
                render: (a: number) => formatCurrency(parseFloat(String(a))),
              },
              {
                title: "Method",
                dataIndex: "payment_method",
              },
              {
                title: "Reference",
                dataIndex: "reference",
                render: (r: string | null) => r || "—",
              },
            ]}
            dataSource={purchase.payments}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </>
      )}
    </Modal>
  );
};

export default PurchaseDetailsModal;
