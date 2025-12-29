import { useState, useEffect } from "react";
import { Customer, Sale, ConsignmentPayment } from "../types";
import { useParams, useNavigate } from "react-router-dom";
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
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  Divider,
  Empty,
  Grid,
  Tooltip,
  Avatar,
  Descriptions,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  FileTextOutlined,
  EyeOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { customerService } from "../services";
import { formatCurrency } from "../utils";
import dayjs from "dayjs";
import ReceiptModal from "./ReceiptModal";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();
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

  // Calculate statistics
  const totalSalesAmount = sales.reduce(
    (sum, sale) => sum + (Number(sale.total_amount) || 0),
    0
  );
  const totalPayments = payments.reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0
  );

  // Get initials from customer name for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "#1890ff",
      "#52c41a",
      "#faad14",
      "#f5222d",
      "#722ed1",
      "#13c2c2",
      "#eb2f96",
      "#fa541c",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const paymentColumns: ColumnsType<ConsignmentPayment> = [
    {
      title: "Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date: string) => (
        <span className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          {new Date(date).toLocaleDateString()}
        </span>
      ),
      sorter: (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: string | number) => (
        <Tag color="green" className="font-medium">
          {formatCurrency(typeof val === "number" ? val : parseFloat(val))}
        </Tag>
      ),
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      responsive: ["md"],
      render: (note: string) =>
        note ? (
          <span className="text-gray-600">{note}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  const salesColumns: ColumnsType<Sale> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          {new Date(date).toLocaleDateString()}
        </span>
      ),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: string | number) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(typeof val === "number" ? val : parseFloat(val))}
        </span>
      ),
      sorter: (a, b) => Number(a.total_amount) - Number(b.total_amount),
    },

    {
      title: "Payment",
      dataIndex: "payment_method",
      key: "payment_method",
      responsive: ["md"],
      render: (method: string) => {
        const colors: Record<string, string> = {
          cash: "green",
          card: "blue",
          credit: "orange",
        };
        return (
          <Tag color={colors[method?.toLowerCase()] || "default"}>
            {method || "N/A"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: Sale) => (
        <Tooltip title="View Receipt">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSaleId(record.id);
              setIsReceiptModalVisible(true);
            }}
          >
            {screens.md && "Receipt"}
          </Button>
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Empty description="Customer not found" />
        <Button
          type="primary"
          onClick={() => navigate("/customers")}
          className="mt-4"
        >
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/customers")}
            className="shrink-0"
          >
            {screens.md && "Back"}
          </Button>
          <div>
            <Title level={2} className="mb-0! text-xl! sm:text-2xl!">
              Customer Details
            </Title>
            <Text className="text-gray-500">
              View and manage customer information
            </Text>
          </div>
        </div>
      </div>

      {/* Customer Profile Card */}
      <Card className="shadow-sm overflow-hidden">
        <Row gutter={[24, 24]}>
          {/* Left Side - Customer Info */}
          <Col xs={24} lg={12}>
            <div className="flex items-start gap-4">
              <Avatar
                size={screens.md ? 80 : 60}
                style={{ backgroundColor: getAvatarColor(customer.name || "") }}
                icon={!customer.name && <UserOutlined />}
                className="shrink-0"
              >
                {customer.name && getInitials(customer.name)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <Title
                  level={3}
                  className="mb-1! text-lg! sm:text-xl! truncate"
                >
                  {customer.name}
                </Title>
                <div className="space-y-2 mt-3">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <PhoneOutlined className="text-blue-500" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <EnvironmentOutlined className="text-green-500 mt-1" />
                      <span className="wrap-break-word">
                        {customer.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Credit Balance */}
          <Col xs={24} lg={12}>
            <div className="bg-linear-to-r from-orange-50 to-yellow-50 rounded-lg p-4 sm:p-6 h-full flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Text className="text-gray-500 text-sm">Credit Balance</Text>
                  <div className="flex items-center gap-2 mt-1">
                    <WalletOutlined className="text-2xl text-orange-500" />
                    <span
                      className={`text-2xl sm:text-3xl font-bold ${
                        (customer.credit_balance || 0) > 0
                          ? "text-orange-500"
                          : "text-green-500"
                      }`}
                    >
                      {formatCurrency(customer.credit_balance || 0)}
                    </span>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => setIsPaymentModalVisible(true)}
                  className="w-full sm:w-auto"
                >
                  Add Payment
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 text-xs sm:text-sm">
                  Total Sales
                </span>
              }
              value={sales.length}
              prefix={<ShoppingCartOutlined className="text-blue-500" />}
              valueStyle={{
                color: "#1890ff",
                fontSize: screens.md ? "24px" : "20px",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 text-xs sm:text-sm">
                  Sales Amount
                </span>
              }
              value={totalSalesAmount}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined className="text-green-500" />}
              valueStyle={{
                color: "#52c41a",
                fontSize: screens.md ? "24px" : "20px",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 text-xs sm:text-sm">
                  Payments Made
                </span>
              }
              value={payments.length}
              prefix={<CreditCardOutlined className="text-purple-500" />}
              valueStyle={{
                color: "#722ed1",
                fontSize: screens.md ? "24px" : "20px",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 text-xs sm:text-sm">
                  Total Paid
                </span>
              }
              value={totalPayments}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<WalletOutlined className="text-cyan-500" />}
              valueStyle={{
                color: "#13c2c2",
                fontSize: screens.md ? "24px" : "20px",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Credit Payments and Sales History - Side by Side */}
      <Row gutter={[24, 24]}>
        {/* Credit Payments Card */}
        <Col xs={24} xl={12}>
          <Card
            className="shadow-sm h-full"
            title={
              <div className="flex items-center gap-2">
                <CreditCardOutlined className="text-purple-500" />
                <span>Credit Payments</span>
                <Tag color="purple">{payments.length}</Tag>
              </div>
            }
          >
            {payments.length > 0 ? (
              <Table
                columns={paymentColumns}
                dataSource={payments}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total) => `${total} payments`,
                  size: screens.md ? "default" : "small",
                }}
                size={screens.md ? "middle" : "small"}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No payments recorded"
              />
            )}
          </Card>
        </Col>

        {/* Sales History Card */}
        <Col xs={24} xl={12}>
          <Card
            className="shadow-sm h-full"
            title={
              <div className="flex items-center gap-2">
                <ShoppingCartOutlined className="text-blue-500" />
                <span>Sales History</span>
                <Tag color="blue">{sales.length}</Tag>
              </div>
            }
          >
            {sales.length > 0 ? (
              <Table
                columns={salesColumns}
                dataSource={sales}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} sales`,
                  size: screens.md ? "default" : "small",
                }}
                size={screens.md ? "middle" : "small"}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No sales found for this customer"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Receipt Modal */}
      <ReceiptModal
        saleId={selectedSaleId}
        visible={isReceiptModalVisible}
        onClose={() => setIsReceiptModalVisible(false)}
      />

      {/* Add Payment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CreditCardOutlined className="text-green-500" />
            <span>Add Credit Payment</span>
          </div>
        }
        open={isPaymentModalVisible}
        onCancel={() => {
          setIsPaymentModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        centered
        width={480}
        destroyOnClose
      >
        <Divider className="my-4" />
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <Text className="text-gray-500">Current Credit Balance</Text>
            <Text
              strong
              className={
                (customer?.credit_balance || 0) > 0
                  ? "text-orange-500 text-lg"
                  : "text-green-500 text-lg"
              }
            >
              {formatCurrency(customer?.credit_balance || 0)}
            </Text>
          </div>
        </div>
        <Form
          form={form}
          onFinish={handleAddPayment}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="amount"
            label="Payment Amount"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                type: "number",
                min: 0.01,
                message: "Amount must be greater than 0",
              },
            ]}
          >
            <InputNumber
              size="large"
              style={{ width: "100%" }}
              prefix={<DollarOutlined className="text-gray-400" />}
              placeholder="Enter payment amount"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) =>
                value?.replace(/\$\s?|(,*)/g, "") as unknown as number
              }
              min={0}
              precision={2}
            />
          </Form.Item>
          <Form.Item
            name="paymentDate"
            label="Payment Date"
            initialValue={dayjs()}
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker
              size="large"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </Form.Item>
          <Form.Item name="note" label="Note (Optional)">
            <Input.TextArea
              placeholder="Add a note for this payment..."
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsPaymentModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Add Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerDetails;
