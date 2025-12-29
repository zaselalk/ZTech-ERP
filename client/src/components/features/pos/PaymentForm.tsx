import { useState } from "react";
import {
  Form,
  InputNumber,
  Typography,
  Row,
  Col,
  Switch,
  Button,
  Space,
  Tag,
  Radio,
  Select,
} from "antd";
import {
  UserOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import type { FormInstance } from "antd/es/form";
import { Customer } from "../../../types";
import { formatCurrency } from "../../../utils";

const { Title, Text } = Typography;
const { Option } = Select;

interface PaymentFormProps {
  form: FormInstance;
  total: number;
  customers: Customer[];
  cart?: { id: number; quantity: number }[];
}

const PaymentForm = ({
  form,
  total,
  customers,
  cart = [],
}: PaymentFormProps) => {
  const paymentMethod = Form.useWatch("payment_method", form);
  const customerId = Form.useWatch("CustomerId", form);
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const change = amountTendered - total;

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleCustomerToggle = (checked: boolean) => {
    setShowCustomerSelect(checked);
    if (!checked) {
      form.setFieldValue("CustomerId", undefined);
    }
  };

  return (
    <>
      {/* Total Display */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
        <Text className="text-indigo-100 text-sm font-medium block mb-1">
          Total Amount Due
        </Text>
        <Title level={1} className="!m-0 !text-white !text-4xl font-bold">
          {formatCurrency(total)}
        </Title>
        <div className="mt-2 pt-2 border-t border-indigo-400/30">
          <Text className="text-indigo-100 text-xs">
            {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
          </Text>
        </div>
      </div>

      {/* Optional Customer Section */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-slate-600" />
            <Text strong className="text-slate-800">
              Add Customer
            </Text>
            <Tag color="blue" className="text-xs">
              Optional
            </Tag>
          </div>
          <Switch
            checked={showCustomerSelect}
            onChange={handleCustomerToggle}
          />
        </div>

        {showCustomerSelect && (
          <Form.Item name="CustomerId" className="mb-0">
            <Select
              placeholder="Search or select a customer..."
              showSearch
              allowClear
              size="large"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              className="w-full"
            >
              {customers.map((customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </div>

      {/* Payment Method - Required */}
      <Form.Item
        name="payment_method"
        label={
          <Text strong className="text-slate-800 text-base">
            Payment Method
          </Text>
        }
        rules={[{ required: true, message: "Please select a payment method" }]}
        className="mb-5"
      >
        <Radio.Group className="w-full payment-method-radio-group">
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={12}>
              <Radio.Button
                value="Cash"
                className="payment-method-card w-full h-20 flex items-center justify-center border-2 rounded-xl transition-all hover:border-green-400 hover:bg-green-50"
              >
                <div className="flex flex-col items-center gap-1">
                  <DollarOutlined className="text-2xl text-green-600" />
                  <Text className="text-sm font-medium">Cash</Text>
                </div>
              </Radio.Button>
            </Col>
            <Col xs={12} sm={12}>
              <Radio.Button
                value="Card"
                className="payment-method-card w-full h-20 flex items-center justify-center border-2 rounded-xl transition-all hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="flex flex-col items-center gap-1">
                  <CreditCardOutlined className="text-2xl text-blue-600" />
                  <Text className="text-sm font-medium">Card</Text>
                </div>
              </Radio.Button>
            </Col>
            <Col xs={12} sm={12}>
              <Radio.Button
                value="Credit"
                className="payment-method-card w-full h-20 flex items-center justify-center border-2 rounded-xl transition-all hover:border-amber-400 hover:bg-amber-50"
              >
                <div className="flex flex-col items-center gap-1">
                  <FileTextOutlined className="text-2xl text-amber-600" />
                  <Text className="text-sm font-medium">Credit</Text>
                </div>
              </Radio.Button>
            </Col>
            <Col xs={12} sm={12}>
              <Radio.Button
                value="Paid"
                className="payment-method-card w-full h-20 flex items-center justify-center border-2 rounded-xl transition-all hover:border-teal-400 hover:bg-teal-50"
              >
                <div className="flex flex-col items-center gap-1">
                  <CheckCircleOutlined className="text-2xl text-teal-600" />
                  <Text className="text-sm font-medium">Paid</Text>
                </div>
              </Radio.Button>
            </Col>
            <Col span={24}>
              <Radio.Button
                value="Cash On Delivery"
                className="payment-method-card w-full h-20 flex items-center justify-center border-2 rounded-xl transition-all hover:border-orange-400 hover:bg-orange-50"
              >
                <div className="flex flex-col items-center gap-1">
                  <CarOutlined className="text-2xl text-orange-600" />
                  <Text className="text-sm font-medium">Cash On Delivery</Text>
                </div>
              </Radio.Button>
            </Col>
          </Row>
        </Radio.Group>
      </Form.Item>

      {/* Credit Warning - only show when customer is selected */}
      {paymentMethod === "Credit" && !selectedCustomer && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <Text className="text-amber-700">
            ⚠️ Please select a customer for credit sales
          </Text>
        </div>
      )}

      {paymentMethod === "Credit" && selectedCustomer && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Text className="text-blue-900 font-medium block">
                Customer: {selectedCustomer.name}
              </Text>
              <Text className="text-sm text-blue-700">
                Current Credit Balance:{" "}
                <strong className="text-blue-800 text-base">
                  {formatCurrency(selectedCustomer.credit_balance || 0)}
                </strong>
              </Text>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <Text className="text-sm text-blue-700">New Balance:</Text>
              <Text className="text-base font-bold text-blue-900">
                {formatCurrency((selectedCustomer.credit_balance || 0) + total)}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment - Amount Tendered */}
      {paymentMethod === "Cash" && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
          {/* Quick Amount Buttons */}
          <div className="mb-4">
            <Text strong className="block mb-2 text-green-900">
              Quick Amount
            </Text>
            <Space wrap size="small">
              <Button
                size="small"
                onClick={() => setAmountTendered(total)}
                className="bg-white border-green-300 text-green-700 hover:bg-green-50"
              >
                Exact
              </Button>
              <Button
                size="small"
                onClick={() => setAmountTendered(Math.ceil(total / 100) * 100)}
                className="bg-white border-green-300 text-green-700 hover:bg-green-50"
              >
                {formatCurrency(Math.ceil(total / 100) * 100)}
              </Button>
              <Button
                size="small"
                onClick={() => setAmountTendered(Math.ceil(total / 500) * 500)}
                className="bg-white border-green-300 text-green-700 hover:bg-green-50"
              >
                {formatCurrency(Math.ceil(total / 500) * 500)}
              </Button>
              <Button
                size="small"
                onClick={() =>
                  setAmountTendered(Math.ceil(total / 1000) * 1000)
                }
                className="bg-white border-green-300 text-green-700 hover:bg-green-50"
              >
                {formatCurrency(Math.ceil(total / 1000) * 1000)}
              </Button>
            </Space>
          </div>

          <Row gutter={16} align="middle">
            <Col span={12}>
              <Text strong className="block mb-2 text-green-900">
                Amount Tendered
              </Text>
              <InputNumber
                min={0}
                className="w-full"
                size="large"
                value={amountTendered}
                onChange={(val) => setAmountTendered(val ?? 0)}
                prefix="Rs."
                autoFocus
                status={
                  amountTendered > 0 && amountTendered < total
                    ? "warning"
                    : undefined
                }
              />
              {amountTendered > 0 && amountTendered < total && (
                <Text type="warning" className="text-xs mt-1 block">
                  Amount is less than total
                </Text>
              )}
            </Col>
            <Col span={12}>
              <Text strong className="block mb-2 text-green-900">
                Change
              </Text>
              <div
                className={`p-3 rounded-lg text-center ${
                  change >= 0
                    ? "bg-green-100 border-2 border-green-300"
                    : "bg-red-100 border-2 border-red-300"
                }`}
              >
                <Title
                  level={3}
                  className={`!m-0 ${
                    change >= 0 ? "!text-green-700" : "!text-red-600"
                  }`}
                >
                  {formatCurrency(change > 0 ? change : 0)}
                </Title>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default PaymentForm;
