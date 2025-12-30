import { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Tag,
  Tooltip,
  Space,
  Grid,
  Modal,
  InputNumber,
  Form,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  EditOutlined,
  PlusOutlined,
  EyeOutlined,
  BarcodeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Product } from "../../../types";
import { formatCurrency } from "../../../utils";
import { productService } from "../../../services";
import { ProductVariantManager } from "./ProductVariantManager";
import type { ColumnsType, ColumnType } from "antd/es/table";

const { useBreakpoint } = Grid;

interface ProductTableProps {
  onEdit: (product: Product) => void;
  refreshTrigger?: number;
  searchText?: string;
  enableProfitTracking?: boolean;
  enableCategoryManagement?: boolean;
  enableBrandManagement?: boolean;
  enableVariantManagement?: boolean;
}

export const ProductTable = ({
  onEdit,
  refreshTrigger,
  searchText = "",
  enableProfitTracking = false,
  enableCategoryManagement = false,
  enableBrandManagement = false,
  enableVariantManagement = false,
}: ProductTableProps) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [stockForm] = Form.useForm();
  const screens = useBreakpoint();

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (product: Product) => {
    setSelectedProduct(product);
    stockForm.setFieldsValue({ quantity: 1 });
    setStockModalVisible(true);
  };

  const handleStockSubmit = async () => {
    try {
      const values = await stockForm.validateFields();
      if (!selectedProduct) return;

      const newQuantity = Number(selectedProduct.quantity) + values.quantity;
      await productService.updateProduct(selectedProduct.id, {
        quantity: newQuantity,
      });

      message.success(
        `Added ${values.quantity} units to ${selectedProduct.name}`
      );
      setStockModalVisible(false);
      stockForm.resetFields();
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      message.error("Failed to update stock");
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: "red", text: "Out of Stock" };
    if (quantity <= 10) return { color: "orange", text: "Low Stock" };
    return { color: "green", text: "In Stock" };
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Product",
      key: "product",
      render: (_: unknown, record: Product) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{record.name}</span>
          {record.barcode && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <BarcodeOutlined /> {record.barcode}
            </span>
          )}
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    ...(enableBrandManagement
      ? ([
          {
            title: "Brand",
            dataIndex: "brand",
            key: "brand",
            responsive: ["md"],
            render: (brand: string) =>
              brand ? (
                <span className="text-gray-600">{brand}</span>
              ) : (
                <span className="text-gray-400">—</span>
              ),
            sorter: (a: Product, b: Product) =>
              (a.brand || "").localeCompare(b.brand || ""),
          },
        ] as ColumnType<Product>[])
      : []),
    ...(enableCategoryManagement
      ? ([
          {
            title: "Category",
            dataIndex: "category",
            key: "category",
            responsive: ["lg"],
            render: (category: string) =>
              category ? (
                <Tag color="blue">{category}</Tag>
              ) : (
                <span className="text-gray-400">—</span>
              ),
            filters: [
              ...new Set(products.map((p) => p.category).filter(Boolean)),
            ].map((cat) => ({ text: cat!, value: cat! })),
            onFilter: (value, record) => record.category === value,
          },
        ] as ColumnType<Product>[])
      : []),
    ...(enableProfitTracking
      ? ([
          {
            title: "Cost",
            dataIndex: "cost_price",
            key: "cost_price",
            responsive: ["xl"],
            render: (cost_price: number | string) => (
              <span className="text-gray-700">
                {formatCurrency(
                  typeof cost_price === "number"
                    ? cost_price
                    : parseFloat(cost_price || "0")
                )}
              </span>
            ),
            sorter: (a: Product, b: Product) =>
              Number(a.cost_price || 0) - Number(b.cost_price || 0),
          },
        ] as ColumnType<Product>[])
      : []),
    {
      title: enableProfitTracking ? "Selling Price" : "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number | string) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(
            typeof price === "number" ? price : parseFloat(price)
          )}
        </span>
      ),
      sorter: (a, b) => Number(a.price) - Number(b.price),
    },
    {
      title: "Stock",
      key: "stock",
      render: (_: unknown, record: Product) => {
        const status = getStockStatus(Number(record.quantity));
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="font-medium">{record.quantity}</span>
            <Tag color={status.color} className="text-xs">
              {status.text}
            </Tag>
          </div>
        );
      },
      sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
    },
    {
      title: "Actions",
      key: "actions",
      width: screens.md ? 200 : 140,
      render: (_: unknown, record: Product) => (
        <Space size="small">
          <Tooltip title="Add Stock">
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => handleAddStock(record)}
              className="text-green-500 hover:text-green-600"
            />
          </Tooltip>
          {enableVariantManagement && (
            <Tooltip title="Manage Variants">
              <Button
                type="text"
                icon={<AppstoreOutlined />}
                onClick={() => setVariantProduct(record)}
                className="text-purple-500 hover:text-purple-600"
              />
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              className="text-blue-500 hover:text-blue-600"
            />
          </Tooltip>
          <Link to={`/products/${record.id}`}>
            <Tooltip title="View Details">
              <Button type="primary" ghost size="small" icon={<EyeOutlined />}>
                {screens.md && "Details"}
              </Button>
            </Tooltip>
          </Link>
        </Space>
      ),
    },
  ];

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <>
      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} products`,
          size: screens.md ? "default" : "small",
        }}
        size={screens.md ? "middle" : "small"}
        scroll={{ x: "max-content" }}
        onRow={(record) => ({
          onClick: (e) => {
            // Prevent navigation when clicking on action buttons
            const target = e.target as HTMLElement;
            if (
              target.closest("button") ||
              target.closest("a") ||
              target.closest(".ant-btn")
            ) {
              return;
            }
            navigate(`/products/${record.id}`);
          },
          style: { cursor: "pointer" },
        })}
        rowClassName="hover:bg-blue-50 transition-colors"
      />

      {/* Add Stock Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-green-500" />
            <span>Add Stock</span>
          </div>
        }
        open={stockModalVisible}
        onCancel={() => {
          setStockModalVisible(false);
          stockForm.resetFields();
          setSelectedProduct(null);
        }}
        onOk={handleStockSubmit}
        okText="Add Stock"
        centered
        width={400}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Product</p>
              <p className="font-semibold text-lg">{selectedProduct.name}</p>
              <p className="text-gray-600 mt-2">
                Current Stock:{" "}
                <span className="font-medium">
                  {selectedProduct.quantity} units
                </span>
              </p>
            </div>
            <Form form={stockForm} layout="vertical">
              <Form.Item
                name="quantity"
                label="Quantity to Add"
                rules={[
                  { required: true, message: "Please enter quantity" },
                  {
                    type: "number",
                    min: 1,
                    message: "Quantity must be at least 1",
                  },
                ]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="Enter quantity to add"
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Product Variant Manager */}
      {enableVariantManagement && variantProduct && (
        <ProductVariantManager
          visible={!!variantProduct}
          productId={variantProduct.id}
          productName={variantProduct.name}
          productPrice={Number(variantProduct.price) || 0}
          productCostPrice={
            variantProduct.cost_price
              ? Number(variantProduct.cost_price)
              : undefined
          }
          onClose={() => setVariantProduct(null)}
          enableProfitTracking={enableProfitTracking}
        />
      )}
    </>
  );
};
