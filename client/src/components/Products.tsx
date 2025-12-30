import { useState, useEffect } from "react";
import { Product } from "../types";
import {
  Form,
  message,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Button,
} from "antd";
import {
  PlusOutlined,
  ShoppingOutlined,
  DollarOutlined,
  SearchOutlined,
  ReloadOutlined,
  InboxOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { productService, settingsService } from "../services";
import { supplierService, type Supplier } from "../services/supplierService";
import { ProductForm, ProductTable } from "./features/products";
import { formatCurrency } from "../utils";

const { Title, Text } = Typography;

const Products = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    totalCategories: 0,
  });
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [enableSupplierManagement, setEnableSupplierManagement] =
    useState(false);
  const [enableProfitTracking, setEnableProfitTracking] = useState(false);
  const [enableCategoryManagement, setEnableCategoryManagement] =
    useState(false);
  const [enableBrandManagement, setEnableBrandManagement] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, [refreshTrigger]);

  const fetchSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      setEnableSupplierManagement(settings.enableSupplierManagement ?? false);
      setEnableProfitTracking(settings.enableProfitTracking ?? false);
      setEnableCategoryManagement(settings.enableCategoryManagement ?? false);
      setEnableBrandManagement(settings.enableBrandManagement ?? false);

      // Only fetch suppliers if the feature is enabled
      if (settings.enableSupplierManagement) {
        try {
          const supplierData = await supplierService.getSuppliers();
          setSuppliers(supplierData);
        } catch (error) {
          console.error("Failed to fetch suppliers", error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const fetchStats = async () => {
    try {
      const products = await productService.getProducts();
      const totalValue = products.reduce(
        (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
        0
      );
      const lowStockItems = products.filter(
        (p) => Number(p.quantity) <= 10
      ).length;
      const categories = new Set(
        products.map((p) => p.category).filter(Boolean)
      );
      setStats({
        totalProducts: products.length,
        totalValue,
        lowStockItems,
        totalCategories: categories.size,
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const showModal = (product: Product | null = null): void => {
    // Ensure numeric fields are properly typed
    const productDetails = {
      ...product,
      price: product?.price ? parseFloat(product.price.toString()) : undefined,
      cost_price: product?.cost_price
        ? parseFloat(product.cost_price.toString())
        : undefined,
      discount: product?.discount
        ? parseFloat(product.discount.toString())
        : undefined,
    };

    setEditingProduct(product);
    form.setFieldsValue(productDetails || {});
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();

      // Sanitize optional fields: convert empty strings to null
      const sanitizedValues = {
        ...values,
        barcode: values.barcode ? values.barcode : null,
        brand: values.brand ? values.brand : null,
        supplier: values.supplier ? values.supplier : null,
        category: values.category ? values.category : null,
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, sanitizedValues);
      } else {
        await productService.createProduct(sanitizedValues);
      }

      message.success(
        `Product ${editingProduct ? "updated" : "created"} successfully`
      );
      setRefreshTrigger((prev) => prev + 1);
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={2} className="mb-1! text-2xl! sm:text-3xl!">
            Inventory
          </Title>
          <Text className="text-gray-500">
            Manage your product inventory and stock levels
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
          className="w-full sm:w-auto"
        >
          Add Product
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={enableCategoryManagement ? 6 : 8}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Products
                </span>
              }
              value={stats.totalProducts}
              prefix={<ShoppingOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1890ff", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={enableCategoryManagement ? 6 : 8}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Inventory Value
                </span>
              }
              value={stats.totalValue}
              prefix={<DollarOutlined className="text-green-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#52c41a", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={enableCategoryManagement ? 6 : 8}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  Low Stock Items
                </span>
              }
              value={stats.lowStockItems}
              prefix={<InboxOutlined className="text-red-500" />}
              valueStyle={{ color: "#f5222d", fontWeight: 600 }}
            />
          </Card>
        </Col>
        {enableCategoryManagement && (
          <Col xs={12} sm={6}>
            <Card
              className="hover:shadow-md transition-shadow"
              styles={{ body: { padding: "20px" } }}
            >
              <Statistic
                title={
                  <span className="text-gray-600 font-medium text-xs sm:text-sm">
                    Categories
                  </span>
                }
                value={stats.totalCategories}
                prefix={<TagsOutlined className="text-purple-500" />}
                valueStyle={{ color: "#722ed1", fontWeight: 600 }}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* Product Table Card */}
      <Card
        className="shadow-sm"
        styles={{ body: { padding: "16px sm:24px" } }}
      >
        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <Input
            placeholder="Search products by name, brand, category..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:max-w-md"
            allowClear
            size="large"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            className="w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>

        <ProductTable
          onEdit={showModal}
          refreshTrigger={refreshTrigger}
          searchText={searchText}
          enableProfitTracking={enableProfitTracking}
          enableCategoryManagement={enableCategoryManagement}
          enableBrandManagement={enableBrandManagement}
        />
      </Card>

      <ProductForm
        visible={isModalVisible}
        editingProduct={editingProduct}
        form={form}
        onOk={handleOk}
        onCancel={handleCancel}
        suppliers={suppliers}
        enableSupplierManagement={enableSupplierManagement}
        enableProfitTracking={enableProfitTracking}
        enableCategoryManagement={enableCategoryManagement}
        enableBrandManagement={enableBrandManagement}
      />
    </div>
  );
};

export default Products;
