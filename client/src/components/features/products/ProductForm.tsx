import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Button,
  Divider,
  Typography,
  Space,
} from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  DollarOutlined,
  BarcodeOutlined,
  TagOutlined,
  TeamOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { Product } from "../../../types";
import { ProductVariantManager } from "./ProductVariantManager";

const { Text } = Typography;

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
  enableVariantManagement?: boolean;
}

// Section header component for visual grouping
const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
    <span className="text-blue-500">{icon}</span>
    <Text strong className="text-gray-700">
      {title}
    </Text>
  </div>
);

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
  enableVariantManagement = false,
}: ProductFormProps) => {
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onOk();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={
          <Space>
            <ShoppingOutlined className="text-blue-500" />
            <span>{editingProduct ? "Edit Product" : "Add New Product"}</span>
          </Space>
        }
        open={visible}
        onOk={handleSubmit}
        onCancel={onCancel}
        width={720}
        centered
        destroyOnClose
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto", padding: "24px" },
        }}
        footer={
          <div className="flex justify-between items-center">
            <Text type="secondary" className="text-xs">
              <span className="text-red-500">*</span> Required fields
            </Text>
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              {enableVariantManagement && editingProduct && (
                <Button
                  icon={<AppstoreOutlined />}
                  onClick={() => setVariantModalVisible(true)}
                >
                  Manage Variants
                </Button>
              )}
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </Space>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          className="product-form"
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} md={12}>
              {/* Basic Information Section */}
              <SectionHeader
                icon={<ShoppingOutlined />}
                title="Basic Information"
              />
              <Form.Item
                name="name"
                label="Product Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter product name",
                  },
                ]}
              >
                <Input
                  prefix={<ShoppingOutlined className="text-gray-400" />}
                  placeholder="e.g., Wireless Bluetooth Headphones"
                  maxLength={100}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="quantity"
                label="Initial Stock"
                rules={[
                  { required: true, message: "Enter quantity" },
                  { type: "integer", message: "Must be a whole number" },
                ]}
                tooltip="Current stock quantity available"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>

              <Form.Item
                name="barcode"
                label="Barcode / SKU"
                tooltip="Unique product identifier for scanning"
              >
                <Input
                  prefix={<BarcodeOutlined className="text-gray-400" />}
                  placeholder="e.g., 8901234567890 or SKU-001"
                  maxLength={50}
                />
              </Form.Item>

              {/* Organization Section */}
              {(enableCategoryManagement ||
                enableBrandManagement ||
                enableSupplierManagement) && (
                <>
                  <Divider className="my-4" />
                  <SectionHeader icon={<TagOutlined />} title="Organization" />
                  {enableCategoryManagement && (
                    <Form.Item
                      name="category"
                      label="Category"
                      tooltip="Group similar products together"
                    >
                      <Input
                        prefix={<AppstoreOutlined className="text-gray-400" />}
                        placeholder="e.g., Electronics, Books, Clothing"
                      />
                    </Form.Item>
                  )}
                  {enableBrandManagement && (
                    <Form.Item name="brand" label="Brand">
                      <Input
                        prefix={<TagOutlined className="text-gray-400" />}
                        placeholder="e.g., Sony, Apple, Samsung"
                      />
                    </Form.Item>
                  )}
                  {enableSupplierManagement && (
                    <Form.Item
                      name="supplier"
                      label="Supplier"
                      tooltip="Where you purchase this product from"
                    >
                      <Select
                        allowClear
                        showSearch
                        placeholder="Select a supplier"
                        optionFilterProp="label"
                        suffixIcon={<TeamOutlined />}
                        notFoundContent={
                          <div className="text-center py-4 text-gray-400">
                            <TeamOutlined className="text-2xl mb-2 block" />
                            <span>No suppliers found</span>
                          </div>
                        }
                        options={suppliers.map((supplier) => ({
                          value: supplier.name,
                          label: supplier.name,
                        }))}
                      />
                    </Form.Item>
                  )}
                </>
              )}
            </Col>

            {/* Right Column */}
            <Col xs={24} md={12}>
              {/* Pricing Section */}
              <SectionHeader icon={<DollarOutlined />} title="Pricing" />
              {enableProfitTracking && (
                <Form.Item
                  name="cost_price"
                  label="Cost Price"
                  rules={[{ type: "number", min: 0 }]}
                  tooltip="Purchase price - used for profit calculation"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="0.00"
                    prefix={<span className="text-gray-400">Rs.</span>}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      value?.replace(/Rs\.\s?|(,*)/g, "") as unknown as number
                    }
                  />
                </Form.Item>
              )}
              <Form.Item
                name="price"
                label={enableProfitTracking ? "Selling Price" : "Price"}
                rules={[
                  { required: true, message: "Please enter price" },
                  { type: "number", min: 0, message: "Price must be positive" },
                ]}
                tooltip={
                  enableProfitTracking
                    ? "Customer-facing price"
                    : "Product price"
                }
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0.00"
                  prefix={<span className="text-gray-400">Rs.</span>}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value?.replace(/Rs\.\s?|(,*)/g, "") as unknown as number
                  }
                />
              </Form.Item>

              <Form.Item
                name="discount"
                label="Default Discount"
                initialValue={0}
                rules={[{ type: "number", min: 0 }]}
                tooltip="Auto-applied discount on this product"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                  addonAfter={
                    <Form.Item
                      name="discount_type"
                      noStyle
                      initialValue="Fixed"
                    >
                      <Select style={{ width: 90 }} size="middle">
                        <Select.Option value="Fixed">Rs.</Select.Option>
                        <Select.Option value="Percentage">%</Select.Option>
                      </Select>
                    </Form.Item>
                  }
                />
              </Form.Item>

              <Divider className="my-4" />
              <SectionHeader icon={<AlertOutlined />} title="Stock Settings" />
              <Form.Item
                name="reorder_threshold"
                label="Low Stock Alert"
                initialValue={1}
                rules={[{ type: "integer" }]}
                tooltip="Get notified when stock falls below this level"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="1"
                  prefix={<AlertOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Product Variant Manager Modal */}
      {enableVariantManagement && editingProduct && (
        <ProductVariantManager
          visible={variantModalVisible}
          productId={editingProduct.id}
          productName={editingProduct.name}
          productPrice={Number(editingProduct.price) || 0}
          productCostPrice={
            editingProduct.cost_price
              ? Number(editingProduct.cost_price)
              : undefined
          }
          onClose={() => setVariantModalVisible(false)}
          enableProfitTracking={enableProfitTracking}
        />
      )}
    </>
  );
};
