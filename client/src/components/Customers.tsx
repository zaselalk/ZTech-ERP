import { useState, useEffect } from "react";
import { Customer } from "../types";
import {
  Button,
  Form,
  message,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Tabs,
} from "antd";
import {
  UserAddOutlined,
  TeamOutlined,
  DollarOutlined,
  SearchOutlined,
  ReloadOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { customerService } from "../services";
import { CustomerForm, CustomerTable } from "./features/customers";
import { CreditTable, PaymentModal } from "./features/credit";
import { formatCurrency } from "../utils";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const Customers = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalCredit: 0,
    customersWithCredit: 0,
  });
  const [form] = Form.useForm();

  // Credit payment state
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const customers = await customerService.getCustomers();
      const totalCredit = customers.reduce(
        (sum, c) => sum + (Number(c.credit_balance) || 0),
        0
      );
      const customersWithCredit = customers.filter(
        (c) => Number(c.credit_balance) > 0
      ).length;
      setStats({
        totalCustomers: customers.length,
        totalCredit,
        customersWithCredit,
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const showModal = (customer: Customer | null = null): void => {
    setEditingCustomer(customer);
    form.setFieldsValue(
      customer || { name: "", location: "", contact: "", consignment: 0 }
    );
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();

      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, values);
      } else {
        await customerService.createCustomer(values);
      }

      message.success(
        `Customer ${editingCustomer ? "updated" : "created"} successfully`
      );
      setRefreshTrigger((prev) => prev + 1);
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await customerService.deleteCustomer(id);
      message.success("Customer deleted successfully");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Credit payment handlers
  const showPaymentModal = (customer: Customer): void => {
    setPaymentCustomer(customer);
    paymentForm.setFieldsValue({
      amount: 0,
      paymentDate: dayjs(),
      note: "",
    });
    setIsPaymentModalVisible(true);
  };

  const handlePaymentCancel = () => {
    setIsPaymentModalVisible(false);
    setPaymentCustomer(null);
    paymentForm.resetFields();
  };

  const handlePaymentOk = async (): Promise<void> => {
    try {
      if (!paymentCustomer) {
        message.error("No customer selected");
        return;
      }
      const values = await paymentForm.validateFields();

      const paymentData = {
        amount: values.amount,
        paymentDate: values.paymentDate.format("YYYY-MM-DD"),
        note: values.note,
      };

      await customerService.addPayment(paymentCustomer.id, paymentData);

      message.success("Payment recorded successfully");
      setRefreshTrigger((prev) => prev + 1);
      handlePaymentCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const tabItems = [
    {
      key: "customers",
      label: (
        <span className="flex items-center gap-2">
          <TeamOutlined />
          Customer List
        </span>
      ),
      children: (
        <div className="space-y-4">
          {/* Search and Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Input
              placeholder="Search customers by name, phone, or address..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:max-w-md"
              allowClear
              size="large"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              className="w-full sm:w-auto"
            >
              Refresh
            </Button>
          </div>

          <CustomerTable
            onEdit={showModal}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
            searchText={searchText}
          />
        </div>
      ),
    },
    {
      key: "credit",
      label: (
        <span className="flex items-center gap-2">
          <WalletOutlined />
          Credit Payments
        </span>
      ),
      children: (
        <CreditTable
          onRecordPayment={showPaymentModal}
          refreshTrigger={refreshTrigger}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={2} className="mb-1! text-2xl! sm:text-3xl!">
            Customers
          </Title>
          <Text className="text-gray-500">
            Manage your customer database and credit accounts
          </Text>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => showModal()}
          size="large"
          className="w-full sm:w-auto"
        >
          Add Customer
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  Total Customers
                </span>
              }
              value={stats.totalCustomers}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1890ff", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  Total Credit Balance
                </span>
              }
              value={stats.totalCredit}
              prefix={<DollarOutlined className="text-orange-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  Customers with Credit
                </span>
              }
              value={stats.customersWithCredit}
              prefix={<TeamOutlined className="text-red-500" />}
              valueStyle={{ color: "#f5222d", fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Customer Tabs */}
      <Card className="shadow-sm">
        <Tabs defaultActiveKey="customers" items={tabItems} size="large" />
      </Card>

      <CustomerForm
        visible={isModalVisible}
        editingCustomer={editingCustomer}
        form={form}
        onOk={handleOk}
        onCancel={handleCancel}
      />

      <PaymentModal
        visible={isPaymentModalVisible}
        customer={paymentCustomer}
        form={paymentForm}
        onOk={handlePaymentOk}
        onCancel={handlePaymentCancel}
      />
    </div>
  );
};

export default Customers;
