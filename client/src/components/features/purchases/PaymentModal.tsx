import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Space,
  Typography,
  Table,
  Checkbox,
} from "antd";
import { DollarOutlined } from "@ant-design/icons";
import {
  purchaseService,
  Purchase,
  SupplierBalance,
} from "../../../services/purchaseService";
import { formatCurrency } from "../../../utils";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplierId: number;
  supplierName: string;
  balance: SupplierBalance | null;
  purchases: Purchase[];
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onSuccess,
  supplierId,
  supplierName,
  balance,
  purchases,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState<number[]>([]);

  const unpaidPurchases = purchases.filter((p) => p.payment_status !== "Paid");

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (values.amount <= 0) {
        message.error("Payment amount must be greater than 0");
        return;
      }

      setLoading(true);

      await purchaseService.makeSupplierPayment(supplierId, {
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        reference: values.reference,
        notes: values.notes,
        paymentDate: values.paymentDate?.toISOString(),
        purchaseIds:
          selectedPurchases.length > 0 ? selectedPurchases : undefined,
      });

      message.success("Payment recorded successfully");
      form.resetFields();
      setSelectedPurchases([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSelect = (purchaseId: number, checked: boolean) => {
    if (checked) {
      setSelectedPurchases([...selectedPurchases, purchaseId]);
    } else {
      setSelectedPurchases(selectedPurchases.filter((id) => id !== purchaseId));
    }
  };

  const handlePayFullBalance = () => {
    if (balance) {
      form.setFieldValue("amount", balance.totalOwed);
    }
  };

  const columns = [
    {
      title: "",
      key: "select",
      width: 50,
      render: (_: any, record: Purchase) => (
        <Checkbox
          checked={selectedPurchases.includes(record.id)}
          onChange={(e) => handlePurchaseSelect(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Invoice",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (value: string, record: Purchase) => value || `#${record.id}`,
    },
    {
      title: "Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Paid",
      dataIndex: "paid_amount",
      key: "paid_amount",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Balance",
      key: "balance",
      render: (_: any, record: Purchase) => (
        <Text type="danger">
          {formatCurrency(
            parseFloat(String(record.total_amount)) -
              parseFloat(String(record.paid_amount))
          )}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined />
          <span>Make Payment to {supplierName}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Record Payment"
      width={700}
    >
      {balance && (
        <div className="bg-linear-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <Text className="text-gray-500">Total Balance Due</Text>
              <Title level={3} className="m-0! text-red-600">
                {formatCurrency(balance.totalOwed)}
              </Title>
            </div>
            <button
              onClick={handlePayFullBalance}
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Pay Full Balance
            </button>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          paymentDate: dayjs(),
          paymentMethod: "Cash",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="amount"
            label="Payment Amount"
            rules={[{ required: true, message: "Please enter payment amount" }]}
          >
            <InputNumber
              min={0}
              prefix="Rs."
              className="w-full"
              placeholder="Enter payment amount"
            />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="Cash">Cash</Select.Option>
              <Select.Option value="Card">Card</Select.Option>
              <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
              <Select.Option value="Cheque">Cheque</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="paymentDate" label="Payment Date">
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="reference" label="Reference Number">
            <Input placeholder="Cheque/Transaction reference" />
          </Form.Item>
        </div>

        <Form.Item name="notes" label="Notes">
          <TextArea rows={2} placeholder="Add payment notes..." />
        </Form.Item>
      </Form>

      {unpaidPurchases.length > 0 && (
        <div className="mt-4">
          <Text strong className="block mb-2">
            Apply to Specific Purchases (Optional)
          </Text>
          <Text className="text-gray-500 text-sm block mb-2">
            If not selected, payment will be applied to oldest purchases first.
          </Text>
          <Table
            columns={columns}
            dataSource={unpaidPurchases}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ y: 200 }}
          />
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
