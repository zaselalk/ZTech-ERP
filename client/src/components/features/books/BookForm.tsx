import { Modal, Form, Input, InputNumber } from "antd";
import { Book } from "../../../types";

interface BookFormProps {
  visible: boolean;
  editingBook: Book | null;
  form: ReturnType<typeof Form.useForm>[0];
  onOk: () => Promise<void>;
  onCancel: () => void;
}

export const BookForm = ({
  visible,
  editingBook,
  form,
  onOk,
  onCancel,
}: BookFormProps) => {
  return (
    <Modal
      title={editingBook ? "Edit Book" : "Add Book"}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="author" label="Author" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="barcode" label="Barcode" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="publisher"
          label="Publisher"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="genre" label="Genre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, type: "number" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true, type: "integer" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="reorder_threshold"
          label="Reorder Threshold"
          rules={[{ required: true, type: "integer" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
