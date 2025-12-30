import { Modal, Form, Input, InputNumber, Select, Row, Col } from "antd";
import { Product } from "../../../types";

interface Supplier {
  id: number;
  name: string;
}

interface ProductFormProps {
  visible: boolean;
  editingProduct: Product | null;
  form: ReturnType<typeof Form.useForm>[0];
  onOk: () => Promise<void>;
  onCancel: () => void;
  suppliers?: Supplier[];
  enableSupplierManagement?: boolean;
  enableProfitTracking?: boolean;
  enableCategoryManagement?: boolean;
  enableBrandManagement?: boolean;
}

export const ProductForm = ({
  visible,
  editingProduct,
  form,
  onOk,
  onCancel,
  suppliers = [],
  enableSupplierManagement = false,
  enableProfitTracking = false,
  enableCategoryManagement = false,
  enableBrandManagement = false,
}: ProductFormProps) => {
  return (
    <Modal
      title={editingProduct ? "Edit Product" : "Add Product"}
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
              name="quantity"
              label="Quantity"
              rules={[{ required: true, type: "integer" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {enableProfitTracking && (
            <Col span={12}>
              <Form.Item
                name="cost_price"
                label="Cost Price (Rs.)"
                rules={[{ type: "number", min: 0 }]}
                tooltip="The price you paid to acquire this product"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Enter cost price"
                />
              </Form.Item>
            </Col>
          )}
          <Col span={enableProfitTracking ? 12 : 24}>
            <Form.Item
              name="price"
              label={
                enableProfitTracking ? "Selling Price (Rs.)" : "Price (Rs.)"
              }
              rules={[{ required: true, type: "number", min: 0 }]}
              tooltip={
                enableProfitTracking
                  ? "The price you sell this product for"
                  : undefined
              }
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder={
                  enableProfitTracking ? "Enter selling price" : "Enter price"
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {enableSupplierManagement && (
            <Col span={12}>
              <Form.Item name="supplier" label="Supplier">
                <Select
                  allowClear
                  showSearch
                  placeholder="Select a supplier"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {suppliers.map((supplier) => (
                    <Select.Option key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={16}>
          {enableCategoryManagement && (
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Input />
              </Form.Item>
            </Col>
          )}
          <Col span={enableCategoryManagement ? 12 : 24}>
            <Form.Item name="barcode" label="Barcode">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {enableBrandManagement && (
            <Col span={12}>
              <Form.Item name="brand" label="Brand">
                <Input />
              </Form.Item>
            </Col>
          )}
          <Col span={enableBrandManagement ? 12 : 24}>
            <Form.Item
              name="reorder_threshold"
              label="Reorder Threshold"
              initialValue={1}
              rules={[{ type: "integer" }]}
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
              rules={[{ type: "number" }]}
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
