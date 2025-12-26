import { Modal, Form, Input } from "antd";
import { Bookshop } from "../../../types";

interface BookshopFormProps {
  visible: boolean;
  editingBookshop: Bookshop | null;
  form: ReturnType<typeof Form.useForm>[0];
  onOk: () => Promise<void>;
  onCancel: () => void;
}

export const BookshopForm = ({
  visible,
  editingBookshop,
  form,
  onOk,
  onCancel,
}: BookshopFormProps) => {
  return (
    <Modal
      title={editingBookshop ? "Edit Bookshop" : "Add Bookshop"}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="consignment"
          label="Consignment"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="location" label="Location">
          <Input />
        </Form.Item>
        <Form.Item name="contact" label="Contact">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
