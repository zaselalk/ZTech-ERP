import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Table,
  Button,
  Space,
  Typography,
  Divider,
  message,
  Switch,
  AutoComplete,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { productService } from "../../../services/productService";
import {
  purchaseService,
  CreatePurchaseData,
} from "../../../services/purchaseService";
import { formatCurrency } from "../../../utils";
import type { Product } from "../../../types";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface PurchaseItem {
  key: string;
  productId?: number;
  productName: string;
  quantity: number;
  unit_cost: number;
  total: number;
}

interface PurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplierId: number;
  supplierName: string;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  onClose,
  onSuccess,
  supplierId,
  supplierName,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (visible) {
      fetchProducts();
      setItems([]);
      form.resetFields();
      form.setFieldsValue({
        purchaseDate: dayjs(),
        updateInventory: true,
        paymentMethod: "Cash",
      });
    }
  }, [visible]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      message.error("Failed to fetch products");
    }
  };

  const productOptions = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          p.barcode?.toLowerCase().includes(searchValue.toLowerCase())
      )
      .map((product) => ({
        value: product.id.toString(),
        label: `${product.name}${
          product.barcode ? ` (${product.barcode})` : ""
        }`,
        product,
      }));
  }, [products, searchValue]);

  const handleAddItem = (productId?: string) => {
    if (productId) {
      const product = products.find((p) => p.id.toString() === productId);
      if (product) {
        // Check if product already added
        if (items.some((item) => item.productId === product.id)) {
          message.warning("Product already added to the list");
          return;
        }

        setItems([
          ...items,
          {
            key: `${product.id}-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unit_cost: product.cost_price || 0,
            total: product.cost_price || 0,
          },
        ]);
        setSearchValue("");
      }
    }
  };

  const handleAddCustomItem = () => {
    setItems([
      ...items,
      {
        key: `custom-${Date.now()}`,
        productName: "",
        quantity: 1,
        unit_cost: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleItemChange = (
    key: string,
    field: keyof PurchaseItem,
    value: any
  ) => {
    setItems(
      items.map((item) => {
        if (item.key === key) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unit_cost") {
            updated.total = updated.quantity * updated.unit_cost;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      if (items.length === 0) {
        message.error("Please add at least one item");
        return;
      }

      // Validate items
      for (const item of items) {
        if (!item.productName && !item.productId) {
          message.error("Please provide product name for all items");
          return;
        }
        if (item.quantity <= 0) {
          message.error("Quantity must be greater than 0");
          return;
        }
        if (item.unit_cost < 0) {
          message.error("Unit cost cannot be negative");
          return;
        }
      }

      setLoading(true);

      const values = form.getFieldsValue();

      const purchaseData: CreatePurchaseData = {
        supplierId,
        invoiceNumber: values.invoiceNumber,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        })),
        notes: values.notes,
        purchaseDate: values.purchaseDate?.toISOString(),
        initialPayment: values.initialPayment || 0,
        paymentMethod: values.paymentMethod,
        updateInventory: values.updateInventory,
      };

      await purchaseService.createPurchase(purchaseData);
      message.success("Purchase created successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || "Failed to create purchase");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      width: 200,
      render: (value: string, record: PurchaseItem) =>
        record.productId ? (
          <Text>{value}</Text>
        ) : (
          <Input
            value={value}
            placeholder="Enter product name"
            onChange={(e) =>
              handleItemChange(record.key, "productName", e.target.value)
            }
          />
        ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (value: number, record: PurchaseItem) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(v) => handleItemChange(record.key, "quantity", v || 1)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Unit Cost",
      dataIndex: "unit_cost",
      key: "unit_cost",
      width: 130,
      render: (value: number, record: PurchaseItem) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(v) => handleItemChange(record.key, "unit_cost", v || 0)}
          prefix="Rs."
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 120,
      render: (value: number) => (
        <Text strong className="text-blue-600">
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: any, record: PurchaseItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>New Purchase from {supplierName}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Create Purchase
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="invoiceNumber" label="Invoice Number">
            <Input placeholder="Enter invoice number" />
          </Form.Item>

          <Form.Item name="purchaseDate" label="Purchase Date">
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="updateInventory"
            label="Update Inventory"
            valuePropName="checked"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </div>

        <Divider>Items</Divider>

        <div className="mb-4 flex gap-2">
          <AutoComplete
            className="flex-1"
            options={productOptions}
            value={searchValue}
            onChange={setSearchValue}
            onSelect={handleAddItem}
            placeholder="Search and select a product..."
            filterOption={false}
          />
          <Button icon={<PlusOutlined />} onClick={handleAddCustomItem}>
            Add Custom Item
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={items}
          pagination={false}
          size="small"
          scroll={{ y: 300 }}
          locale={{ emptyText: "No items added yet" }}
        />

        <div className="mt-4 flex justify-end">
          <div className="text-right">
            <Text className="text-gray-500">Total Amount: </Text>
            <Title level={4} className="inline-block m-0! text-blue-600">
              {formatCurrency(totalAmount)}
            </Title>
          </div>
        </div>

        <Divider>Payment</Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="initialPayment" label="Initial Payment">
            <InputNumber
              min={0}
              max={totalAmount}
              prefix="Rs."
              className="w-full"
              placeholder="Enter initial payment amount"
            />
          </Form.Item>

          <Form.Item name="paymentMethod" label="Payment Method">
            <Select>
              <Select.Option value="Cash">Cash</Select.Option>
              <Select.Option value="Card">Card</Select.Option>
              <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
              <Select.Option value="Cheque">Cheque</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="notes" label="Notes">
          <TextArea rows={2} placeholder="Add notes about this purchase..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PurchaseModal;
