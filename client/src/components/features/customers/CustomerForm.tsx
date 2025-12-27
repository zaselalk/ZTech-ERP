import { Modal, Form, Input, InputNumber } from "antd";
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
      title={editingCustomer ? "Edit Customer" : "Add Customer"}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="credit_balance"
          label="Credit Balance"
          initialValue={0}
          rules={[{ type: "number" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
