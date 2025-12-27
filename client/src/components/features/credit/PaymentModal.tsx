import { Modal, Form, InputNumber, DatePicker, Input } from "antd";
import { Customer } from "../../../types";

interface PaymentModalProps {
  visible: boolean;
  customer: Customer | null;
  form: ReturnType<typeof Form.useForm>[0];
  onOk: () => Promise<void>;
  onCancel: () => void;
}

export const PaymentModal = ({
  visible,
  customer,
  form,
  onOk,
  onCancel,
}: PaymentModalProps) => {
  return (
    <Modal
      title={`Record Payment for ${customer?.name || ""}`}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="amount"
          label="Amount Paid"
          rules={[{ required: true, type: "number", min: 0.01 }]}
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
          rules={[{ required: true, message: "Please select date" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="note" label="Note">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
