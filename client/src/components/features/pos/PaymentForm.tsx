import { useState } from "react";
import { Form, Select, InputNumber, Typography, Row, Col } from "antd";
import type { FormInstance } from "antd/es/form";
import { Customer } from "../../../types";
import { formatCurrency } from "../../../utils";

const { Title, Text } = Typography;
const { Option } = Select;

interface PaymentFormProps {
  form: FormInstance;
  total: number;
  customers: Customer[];
}

const PaymentForm = ({ form, total, customers }: PaymentFormProps) => {
  const paymentMethod = Form.useWatch("payment_method", form);
  const customerId = Form.useWatch("CustomerId", form);
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const change = amountTendered - total;

  const selectedCustomer = customers.find((c) => c.id === customerId);

  return (
    <>
      <Title level={4}>Total Due: {formatCurrency(total)}</Title>
      <Form.Item
        name="CustomerId"
        label="Customer"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select a customer">
          {customers.map((customer) => (
            <Option key={customer.id} value={customer.id}>
              {customer.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="payment_method"
        label="Payment Method"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select a payment method">
          <Option value="Cash">Cash</Option>
          <Option value="Card">Card</Option>
          <Option value="Credit">Credit</Option>
          <Option value="Paid">Paid</Option>
          <Option value="Cash On Delivery">Cash On Delivery</Option>
        </Select>
      </Form.Item>

      {paymentMethod === "Credit" && selectedCustomer && (
        <div
          style={{
            marginBottom: 16,
            padding: 10,
            background: "#f5f5f5",
            borderRadius: 4,
          }}
        >
          <Text>
            Current Credit Balance:{" "}
            <strong>
              {formatCurrency(selectedCustomer.credit_balance || 0)}
            </strong>
          </Text>
          <br />
          <Text type="secondary">
            This sale will increase the balance by {formatCurrency(total)}
          </Text>
        </div>
      )}

      {paymentMethod === "Cash" && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Amount Tendered">
              <InputNumber
                min={total}
                className="w-full"
                value={amountTendered}
                onChange={(val) => setAmountTendered(val ?? 0)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Title level={5} className="pt-[30px]">
              Change: {formatCurrency(change > 0 ? change : 0)}
            </Title>
          </Col>
        </Row>
      )}
    </>
  );
};

export default PaymentForm;
