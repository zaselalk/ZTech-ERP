import { useState, useEffect } from "react";
import { Customer, Sale, ConsignmentPayment } from "../types";
import { useParams } from "react-router-dom";
import {
  Card,
  Spin,
  message,
  Table,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
} from "antd";
import { customerService } from "../services";
import { formatCurrency } from "../utils";
import dayjs from "dayjs";
import ReceiptModal from "./ReceiptModal";

const { Title } = Typography;

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<ConsignmentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const customerResponse = await customerService.getCustomerById(id!);
        setCustomer(customerResponse);

        const salesResponse = await customerService.getCustomerSales(id!);
        setSales(salesResponse);

        const paymentsResponse = await customerService.getPayments(id!);
        setPayments(paymentsResponse);
      } catch (error) {
        message.error("Failed to fetch customer details");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  const handleAddPayment = async (values: any) => {
    try {
      const paymentData = {
        amount: values.amount,
        paymentDate: values.paymentDate.format("YYYY-MM-DD"),
        note: values.note,
      };
      await customerService.addPayment(id!, paymentData);
      message.success("Payment added successfully");
      setIsPaymentModalVisible(false);
      form.resetFields();

      // Refresh data
      const customerResponse = await customerService.getCustomerById(id!);
      setCustomer(customerResponse);
      const paymentsResponse = await customerService.getPayments(id!);
      setPayments(paymentsResponse);
    } catch (error) {
      message.error("Failed to add payment");
    }
  };

  const paymentColumns = [
    {
      title: "Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: string | number) =>
        `${formatCurrency(typeof val === "number" ? val : parseFloat(val))}`,
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
    },
  ];

  const salesColumns = [
    { title: "Sale ID", dataIndex: "id", key: "id" },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: string | number) =>
        `${formatCurrency(typeof val === "number" ? val : parseFloat(val))}`,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (val: string | number) =>
        `${formatCurrency(typeof val === "number" ? val : parseFloat(val))}`,
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Sale) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedSaleId(record.id);
            setIsReceiptModalVisible(true);
          }}
        >
          View Receipt
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div>
      <Card title={`Customer: ${customer.name}`}>
        <p>
          <strong>Address:</strong> {customer.address}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phone}
        </p>
        <p>
          <strong>Credit Balance:</strong>{" "}
          {formatCurrency(customer.credit_balance || 0)}
          <Button
            type="primary"
            size="small"
            style={{ marginLeft: 10 }}
            onClick={() => setIsPaymentModalVisible(true)}
          >
            Add Payment
          </Button>
        </p>
      </Card>

      <Title level={4} style={{ marginTop: "24px" }}>
        Credit Payments
      </Title>
      <Table columns={paymentColumns} dataSource={payments} rowKey="id" />

      <Title level={4} style={{ marginTop: "24px" }}>
        Sales History
      </Title>
      <Table columns={salesColumns} dataSource={sales} rowKey="id" />

      <ReceiptModal
        saleId={selectedSaleId}
        visible={isReceiptModalVisible}
        onClose={() => setIsReceiptModalVisible(false)}
      />

      <Modal
        title="Add Credit Payment"
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddPayment} layout="vertical">
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) =>
                value?.replace(/\Rs.\s?|(,*)/g, "") as unknown as number
              }
            />
          </Form.Item>
          <Form.Item
            name="paymentDate"
            label="Payment Date"
            initialValue={dayjs()}
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Payment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerDetails;
