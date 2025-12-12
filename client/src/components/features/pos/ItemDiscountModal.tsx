import { useEffect } from "react";
import { Modal, Form, InputNumber, Select } from "antd";
import { CartItem } from "./types";

const { Option } = Select;

interface ItemDiscountModalProps {
  item: CartItem;
  visible: boolean;
  onApply: (
    id: number,
    values: { discountValue: number; discountType: "Fixed" | "Percentage" }
  ) => void;
  onCancel: () => void;
}

const ItemDiscountModal = ({
  item,
  visible,
  onApply,
  onCancel,
}: ItemDiscountModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        discountValue: item.discountValue || 0,
        discountType: item.discountType || "Fixed",
      });
    }
  }, [visible, item, form]);

  const handleApply = () => {
    form.validateFields().then((values) => {
      onApply(item.id, values);
    });
  };

  return (
    <Modal
      title={`Discount for ${item.name}`}
      open={visible}
      onOk={handleApply}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Discount Value" name="discountValue">
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item label="Discount Type" name="discountType">
          <Select>
            <Option value="Fixed">Fixed (LKR)</Option>
            <Option value="Percentage">Percentage (%)</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ItemDiscountModal;
