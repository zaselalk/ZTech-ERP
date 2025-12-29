import { formatCurrency } from "../utils";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  message,
  Table,
  Typography,
  Button,
  Row,
  Col,
  Statistic,
  Tag,
  Empty,
  Grid,
  Tooltip,
  Avatar,
  Popconfirm,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  DollarOutlined,
  TagOutlined,
  BarcodeOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  InboxOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { productService } from "../services";
import { Product } from "../types";
import ReceiptModal from "./ReceiptModal";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [product, setProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<{
    totalSold: number;
    totalRevenue: number;
    sales: any[];
  }>({
    totalSold: 0,
    totalRevenue: 0,
    sales: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productResponse = await productService.getProductById(id!);
        setProduct(productResponse);
        const statsResponse = await productService.getProductStats(id!);
        setStats(statsResponse);
      } catch (error) {
        message.error("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(Number(id));
      message.success("Product deleted successfully");
      navigate("/inventory");
    } catch (error) {
      message.error("Failed to delete product");
    }
  };

  // Get initials from product name for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "#1890ff",
      "#52c41a",
      "#faad14",
      "#f5222d",
      "#722ed1",
      "#13c2c2",
      "#eb2f96",
      "#fa541c",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Calculate top customers
  const customerMap = new Map<
    number,
    {
      customer: { id: number; name: string };
      total_quantity: number;
      date: string;
    }
  >();
  stats.sales.forEach((item: any) => {
    const customer = item.sale?.customer;
    if (customer) {
      const existing = customerMap.get(customer.id);
      if (existing) {
        existing.total_quantity += item.quantity;
        if (new Date(item.createdAt) > new Date(existing.date)) {
          existing.date = item.createdAt;
        }
      } else {
        customerMap.set(customer.id, {
          customer: { id: customer.id, name: customer.name },
          total_quantity: item.quantity,
          date: item.createdAt,
        });
      }
    }
  });
  const topCustomers = Array.from(customerMap.values()).sort(
    (a, b) => b.total_quantity - a.total_quantity
  );

  const topCustomersColumns: ColumnsType<{
    customer: { id: number; name: string };
    total_quantity: number;
    date: string;
  }> = [
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customer_name",
      render: (name: string) => (
        <span className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          <span className="font-medium">{name}</span>
        </span>
      ),
    },
    {
      title: "Total Purchased",
      dataIndex: "total_quantity",
      key: "total_quantity",
      render: (qty: number) => (
        <Tag color="blue" className="font-medium">
          {qty} units
        </Tag>
      ),
      sorter: (a, b) => a.total_quantity - b.total_quantity,
    },
    {
      title: "Last Purchase",
      dataIndex: "date",
      key: "date",
      render: (text: string) => (
        <span className="flex items-center gap-2 text-gray-600">
          <CalendarOutlined className="text-gray-400" />
          {new Date(text).toLocaleDateString()}
        </span>
      ),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: "descend",
    },
  ];

  const salesColumns: ColumnsType<any> = [
    {
      title: "Customer",
      dataIndex: ["sale", "customer", "name"],
      key: "customer",
      render: (name: string) => (
        <span className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          {name || "Walk-in"}
        </span>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number) => <Tag color="purple">{qty} units</Tag>,
    },

    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => (
        <span className="flex items-center gap-2 text-gray-600">
          <CalendarOutlined className="text-gray-400" />
          {new Date(val).toLocaleDateString()}
        </span>
      ),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: any) => (
        <Tooltip title="View Receipt">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSaleId(record.sale.id);
              setIsReceiptModalVisible(true);
            }}
          >
            {screens.md && "Receipt"}
          </Button>
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Empty description="Product not found" />
        <Button
          type="primary"
          onClick={() => navigate("/inventory")}
          className="mt-4"
        >
          Back to Products
        </Button>
      </div>
    );
  }

  const stockStatus =
    Number(product.quantity) === 0
      ? { color: "red", text: "Out of Stock" }
      : Number(product.quantity) <= 10
      ? { color: "orange", text: "Low Stock" }
      : { color: "green", text: "In Stock" };

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/inventory")}
            className="shrink-0"
          >
            {screens.md && "Back"}
          </Button>
          <div>
            <Title level={2} className="mb-0! text-xl! sm:text-2xl!">
              Product Details
            </Title>
            <Text className="text-gray-500">
              View product information and sales history
            </Text>
          </div>
        </div>
        <Space>
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product? This action cannot be undone."
            onConfirm={handleDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              {screens.md && "Delete"}
            </Button>
          </Popconfirm>
        </Space>
      </div>

      {/* Product Profile Card */}
      <Card className="shadow-sm overflow-hidden">
        <Row gutter={[24, 24]}>
          {/* Left Side - Product Info */}
          <Col xs={24} lg={12}>
            <div className="flex items-start gap-4">
              <Avatar
                size={screens.md ? 80 : 60}
                style={{ backgroundColor: getAvatarColor(product.name || "") }}
                icon={!product.name && <ShoppingOutlined />}
                className="shrink-0"
              >
                {product.name && getInitials(product.name)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <Title
                  level={3}
                  className="mb-1! text-lg! sm:text-xl! truncate"
                >
                  {product.name}
                </Title>
                <div className="space-y-2 mt-3">
                  {product.barcode && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <BarcodeOutlined className="text-blue-500" />
                      <span className="font-mono">{product.barcode}</span>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <TagOutlined className="text-purple-500" />
                      <span>{product.brand}</span>
                    </div>
                  )}
                  {product.category && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <ShoppingOutlined className="text-green-500" />
                      <Tag color="blue">{product.category}</Tag>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Price & Stock Info */}
          <Col xs={24} lg={12}>
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 h-full">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Text className="text-gray-500 text-sm">Selling Price</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarOutlined className="text-2xl text-green-500" />
                      <span className="text-2xl sm:text-3xl font-bold text-green-600">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>
                  <Tag color={stockStatus.color} className="text-sm px-3 py-1">
                    {stockStatus.text}
                  </Tag>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-blue-100">
                  <div>
                    <Text className="text-gray-500 text-sm">Current Stock</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <InboxOutlined className="text-xl text-blue-500" />
                      <span className="text-xl font-semibold text-gray-900">
                        {product.quantity} units
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 text-xs sm:text-sm">
                  Total Sold
                </span>
              }
              value={stats.totalSold}
              prefix={<ShoppingCartOutlined className="text-blue-500" />}
              valueStyle={{
                color: "#1890ff",
                fontSize: screens.md ? "24px" : "20px",
              }}
              suffix="units"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 text-xs sm:text-sm">
                  Total Revenue
                </span>
              }
              value={stats.totalRevenue}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined className="text-green-500" />}
              valueStyle={{
                color: "#52c41a",
                fontSize: screens.md ? "24px" : "20px",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 text-xs sm:text-sm">
                  Sales Count
                </span>
              }
              value={stats.sales.length}
              prefix={<RiseOutlined className="text-purple-500" />}
              valueStyle={{
                color: "#722ed1",
                fontSize: screens.md ? "24px" : "20px",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 text-xs sm:text-sm">
                  Top Buyers
                </span>
              }
              value={topCustomers.length}
              prefix={<UserOutlined className="text-cyan-500" />}
              valueStyle={{
                color: "#13c2c2",
                fontSize: screens.md ? "24px" : "20px",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Customers and Sales History - Side by Side */}
      <Row gutter={[24, 24]}>
        {/* Top Customers Card */}
        <Col xs={24} xl={12}>
          <Card
            className="shadow-sm h-full"
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-cyan-500" />
                <span>Top Customers</span>
                <Tag color="cyan">{topCustomers.length}</Tag>
              </div>
            }
          >
            {topCustomers.length > 0 ? (
              <Table
                columns={topCustomersColumns}
                dataSource={topCustomers}
                rowKey={(record) => record.customer.id}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showTotal: (total) => `${total} customers`,
                  size: screens.md ? "default" : "small",
                }}
                size={screens.md ? "middle" : "small"}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No customer purchases yet"
              />
            )}
          </Card>
        </Col>

        {/* Sales History Card */}
        <Col xs={24} xl={12}>
          <Card
            className="shadow-sm h-full"
            title={
              <div className="flex items-center gap-2">
                <ShoppingCartOutlined className="text-blue-500" />
                <span>Sales History</span>
                <Tag color="blue">{stats.sales.length}</Tag>
              </div>
            }
          >
            {stats.sales.length > 0 ? (
              <Table
                columns={salesColumns}
                dataSource={stats.sales}
                rowKey="id"
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} sales`,
                  size: screens.md ? "default" : "small",
                }}
                size={screens.md ? "middle" : "small"}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No sales recorded for this product"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Receipt Modal */}
      <ReceiptModal
        saleId={selectedSaleId}
        visible={isReceiptModalVisible}
        onClose={() => setIsReceiptModalVisible(false)}
      />
    </div>
  );
};

export default ProductDetails;
