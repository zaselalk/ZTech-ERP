import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Table,
  Space,
  message,
  Popconfirm,
  Tag,
  Empty,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "../../../utils";
import {
  productVariantService,
  type ProductVariant,
  type CreateVariantData,
  type UpdateVariantData,
} from "../../../services/productVariantService";
import type { ColumnsType } from "antd/es/table";

interface ProductVariantManagerProps {
  visible: boolean;
  productId: number;
  productName: string;
  productPrice: number;
  productCostPrice?: number;
  onClose: () => void;
  enableProfitTracking?: boolean;
}

export const ProductVariantManager = ({
  visible,
  productId,
  productName,
  productPrice,
  productCostPrice,
  onClose,
  enableProfitTracking = false,
}: ProductVariantManagerProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && productId) {
      fetchVariants();
    }
  }, [visible, productId]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const data = await productVariantService.getVariantsByProduct(
        productId,
        true
      );
      setVariants(data);
    } catch (error) {
      message.error("Failed to fetch variants");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const values = await form.validateFields();

      if (editingVariant) {
        const updateData: UpdateVariantData = {
          name: values.name,
          sku: values.sku || null,
          barcode: values.barcode || null,
          price: values.price ?? null,
          cost_price: values.cost_price ?? null,
          quantity: values.quantity ?? 0,
          attributes: values.attributes ? JSON.parse(values.attributes) : null,
        };
        await productVariantService.updateVariant(
          editingVariant.id,
          updateData
        );
        message.success("Variant updated successfully");
      } else {
        const createData: CreateVariantData = {
          ProductId: productId,
          name: values.name,
          sku: values.sku || undefined,
          barcode: values.barcode || undefined,
          price: values.price ?? undefined,
          cost_price: values.cost_price ?? undefined,
          quantity: values.quantity ?? 0,
          attributes: values.attributes
            ? JSON.parse(values.attributes)
            : undefined,
        };
        await productVariantService.createVariant(createData);
        message.success("Variant created successfully");
      }

      setFormVisible(false);
      setEditingVariant(null);
      form.resetFields();
      fetchVariants();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(error.message || "Failed to save variant");
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    form.setFieldsValue({
      name: variant.name,
      sku: variant.sku,
      barcode: variant.barcode,
      price: variant.price,
      cost_price: variant.cost_price,
      quantity: variant.quantity,
      attributes: variant.attributes ? JSON.stringify(variant.attributes) : "",
    });
    setFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await productVariantService.deleteVariant(id);
      message.success("Variant deleted");
      fetchVariants();
    } catch (error) {
      message.error("Failed to delete variant");
    }
  };

  const handleAddNew = () => {
    setEditingVariant(null);
    form.resetFields();
    setFormVisible(true);
  };

  const columns: ColumnsType<ProductVariant> = [
    {
      title: "Variant Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: ProductVariant) => (
        <div>
          <span className="font-medium">{name}</span>
          {!record.isActive && (
            <Tag color="red" className="ml-2">
              Inactive
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku: string) =>
        sku ? (
          <span className="font-mono text-sm">{sku}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      render: (barcode: string) =>
        barcode ? (
          <span className="flex items-center gap-1 text-sm">
            <BarcodeOutlined /> {barcode}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Price",
      key: "price",
      render: (_: unknown, record: ProductVariant) => {
        const price = record.price ?? productPrice;
        const isOverride = record.price !== null;
        return (
          <Tooltip title={isOverride ? "Custom price" : "Uses product price"}>
            <span className={isOverride ? "font-semibold text-blue-600" : ""}>
              {formatCurrency(price)}
            </span>
          </Tooltip>
        );
      },
    },
    ...(enableProfitTracking
      ? [
          {
            title: "Cost",
            key: "cost_price",
            render: (_: unknown, record: ProductVariant) => {
              const cost = record.cost_price ?? productCostPrice ?? 0;
              const isOverride = record.cost_price !== null;
              return (
                <Tooltip
                  title={isOverride ? "Custom cost" : "Uses product cost"}
                >
                  <span className={isOverride ? "text-green-600" : ""}>
                    {formatCurrency(cost)}
                  </span>
                </Tooltip>
              );
            },
          } as any,
        ]
      : []),
    {
      title: "Stock",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => (
        <Tag color={quantity > 0 ? "green" : "red"}>{quantity}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ProductVariant) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this variant?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`Variants - ${productName}`}
        open={visible}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
          >
            Add Variant
          </Button>,
        ]}
      >
        <Table
          dataSource={variants}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
          locale={{
            emptyText: (
              <Empty
                description="No variants yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddNew}
                >
                  Create First Variant
                </Button>
              </Empty>
            ),
          }}
        />
      </Modal>

      {/* Add/Edit Variant Form Modal */}
      <Modal
        title={editingVariant ? "Edit Variant" : "Add Variant"}
        open={formVisible}
        onOk={handleCreateOrUpdate}
        onCancel={() => {
          setFormVisible(false);
          setEditingVariant(null);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Variant Name"
            rules={[{ required: true, message: "Please enter variant name" }]}
            tooltip="E.g., 'Red - Large', 'Blue - Small', '500ml'"
          >
            <Input placeholder="Enter variant name" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="sku"
              label="SKU"
              tooltip="Stock Keeping Unit - unique identifier"
            >
              <Input placeholder="Optional SKU code" />
            </Form.Item>

            <Form.Item
              name="barcode"
              label="Barcode"
              tooltip="Unique barcode for this variant"
            >
              <Input placeholder="Optional barcode" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="price"
              label="Price Override (Rs.)"
              tooltip="Leave empty to use parent product price"
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder={`Default: ${formatCurrency(productPrice)}`}
              />
            </Form.Item>

            {enableProfitTracking && (
              <Form.Item
                name="cost_price"
                label="Cost Price Override (Rs.)"
                tooltip="Leave empty to use parent product cost"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder={
                    productCostPrice
                      ? `Default: ${formatCurrency(productCostPrice)}`
                      : "Enter cost price"
                  }
                />
              </Form.Item>
            )}
          </div>

          <Form.Item
            name="quantity"
            label="Stock Quantity"
            initialValue={0}
            rules={[{ type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            name="attributes"
            label="Attributes (JSON)"
            tooltip='Optional: {"color": "Red", "size": "Large"}'
          >
            <Input.TextArea
              rows={2}
              placeholder='e.g., {"color": "Red", "size": "Large"}'
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
