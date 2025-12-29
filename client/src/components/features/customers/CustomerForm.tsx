import { Modal, Form, Input, InputNumber, Row, Col, Divider } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Customer } from "../../../types";

interface CustomerFormProps {
  visible: boolean;
  editingCustomer: Customer | null;
  form: ReturnType<typeof Form.useForm>[0];
  onOk: () => Promise<void>;
  onCancel: () => void;
}

export const CustomerForm = ({
  visible,
  editingCustomer,
  form,
  onOk,
  onCancel,
}: CustomerFormProps) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined className="text-blue-500" />
          <span>{editingCustomer ? "Edit Customer" : "Add New Customer"}</span>
        </div>
      }
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={editingCustomer ? "Update" : "Create"}
      cancelText="Cancel"
      width={520}
      centered
      destroyOnClose
    >
      <Divider className="my-4!" />
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="name"
          label="Customer Name"
          rules={[
            { required: true, message: "Please enter customer name" },
            { min: 2, message: "Name must be at least 2 characters" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Enter customer name"
            size="large"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  pattern: /^[0-9+\-\s()]*$/,
                  message: "Please enter a valid phone number",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="e.g., +94 77 123 4567"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="credit_balance"
              label="Credit Balance"
              initialValue={0}
              rules={[
                { type: "number", message: "Please enter a valid number" },
              ]}
            >
              <InputNumber
                prefix={<DollarOutlined className="text-gray-400" />}
                placeholder="0.00"
                size="large"
                style={{ width: "100%" }}
                min={0}
                precision={2}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) =>
                  value?.replace(/\$\s?|(,*)/g, "") as unknown as number
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <Input.TextArea
            placeholder="Enter customer address"
            rows={3}
            showCount
            maxLength={200}
            style={{ resize: "none" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
