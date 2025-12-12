import { Modal, Form, Input, InputNumber, Select, Row, Col } from "antd";
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
      width={800}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="author"
              label="Author"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="barcode"
              label="Barcode"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="publisher"
              label="Publisher"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="genre" label="Genre" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, type: "number" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, type: "integer" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="reorder_threshold"
              label="Reorder Threshold"
              rules={[{ required: true, type: "integer" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="discount"
              label="Discount"
              initialValue={0}
              rules={[{ required: true, type: "number" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder="Enter discount value"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="discount_type"
              label="Discount Type"
              initialValue="Fixed"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="Fixed">Fixed Amount (Rs.)</Select.Option>
                <Select.Option value="Percentage">Percentage (%)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
