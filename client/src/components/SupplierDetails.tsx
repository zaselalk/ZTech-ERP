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
  Avatar,
  Input,
} from "antd";
import {
  ArrowLeftOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileTextOutlined,
  InboxOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { supplierService, Supplier } from "../services/supplierService";
import { formatCurrency } from "../utils";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface SupplierProduct {
  id: number;
  name: string;
  code: string;
  category: string;
  quantity: number;
  price: number;
  buyPrice: number | null;
}

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      try {
        const supplierResponse = await supplierService.getSupplierById(id!);
        setSupplier(supplierResponse);

        const productsResponse = await supplierService.getSupplierProducts(id!);
        setProducts(productsResponse);
      } catch (error) {
        message.error("Failed to fetch supplier details");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDetails();
  }, [id]);

  // Calculate statistics
  const totalProducts = products.length;
  const totalStockValue = products.reduce(
    (sum, product) => sum + (product.buyPrice || 0) * product.quantity,
    0
  );
  const totalCreditAmount = products.reduce(
    (sum, product) => sum + (product.buyPrice || 0) * product.quantity,
    0
  );

  // Get initials from supplier name for avatar
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

  // Filter products by search text
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.code.toLowerCase().includes(searchText.toLowerCase()) ||
      product.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const productColumns: ColumnsType<SupplierProduct> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 100,
      render: (code: string) => (
        <Tag color="blue" className="font-mono">
          {code}
        </Tag>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name}</span>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      responsive: ["md"],
      render: (category: string) => (
        <Tag color="purple">{category || "N/A"}</Tag>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      render: (qty: number) => (
        <span
          className={`font-medium ${
            qty <= 5 ? "text-red-500" : "text-gray-900"
          }`}
        >
          {qty}
        </span>
      ),
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Buy Price",
      dataIndex: "buyPrice",
      key: "buyPrice",
      align: "right",
      responsive: ["sm"],
      render: (price: number | null) => (
        <span className="text-gray-600">
          {price != null ? formatCurrency(price) : "—"}
        </span>
      ),
      sorter: (a, b) => (a.buyPrice || 0) - (b.buyPrice || 0),
    },
    {
      title: "Sell Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(price)}
        </span>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Stock Value",
      key: "stockValue",
      align: "right",
      responsive: ["lg"],
      render: (_: unknown, record: SupplierProduct) => (
        <span className="font-medium text-blue-600">
          {formatCurrency((record.buyPrice || 0) * record.quantity)}
        </span>
      ),
      sorter: (a, b) =>
        (a.buyPrice || 0) * a.quantity - (b.buyPrice || 0) * b.quantity,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Empty description="Supplier not found" />
        <Button
          type="primary"
          onClick={() => navigate("/suppliers")}
          className="mt-4"
        >
          Back to Suppliers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/suppliers")}
            className="shrink-0"
          >
            {screens.md && "Back"}
          </Button>
          <div>
            <Title level={2} className="mb-0! text-xl! sm:text-2xl!">
              Supplier Details
            </Title>
            <Text className="text-gray-500">
              View supplier information and products
            </Text>
          </div>
        </div>
      </div>

      {/* Supplier Profile Card */}
      <Card className="shadow-sm overflow-hidden">
        <Row gutter={[24, 24]}>
          {/* Left Side - Supplier Info */}
          <Col xs={24} lg={12}>
            <div className="flex items-start gap-4">
              <Avatar
                size={screens.md ? 80 : 60}
                style={{ backgroundColor: getAvatarColor(supplier.name || "") }}
                icon={!supplier.name && <ShopOutlined />}
                className="shrink-0"
              >
                {supplier.name && getInitials(supplier.name)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <Title
                  level={3}
                  className="mb-1! text-lg! sm:text-xl! truncate"
                >
                  {supplier.name}
                </Title>
                <div className="space-y-2 mt-3">
                  {supplier.contactPerson && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserOutlined className="text-purple-500" />
                      <span>{supplier.contactPerson}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <PhoneOutlined className="text-blue-500" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MailOutlined className="text-green-500" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <EnvironmentOutlined className="text-orange-500 mt-1" />
                      <span className="wrap-break-word">
                        {supplier.address}
                      </span>
                    </div>
                  )}
                  {supplier.notes && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <FileTextOutlined className="text-gray-400 mt-1" />
                      <span className="wrap-break-word italic">
                        {supplier.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Credit Amount */}
          <Col xs={24} lg={12}>
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-lg p-4 sm:p-6 h-full flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Text className="text-gray-500 text-sm">
                    Total Stock Value (Amount to Pay)
                  </Text>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarOutlined className="text-2xl text-blue-500" />
                    <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {formatCurrency(totalCreditAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="shadow-sm h-full">
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <InboxOutlined className="text-purple-500" />
                  Total Products
                </span>
              }
              value={totalProducts}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="shadow-sm h-full">
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <DollarOutlined className="text-blue-500" />
                  Total Stock Value
                </span>
              }
              value={totalStockValue}
              precision={2}
              prefix="Rs."
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="shadow-sm h-full">
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <InboxOutlined className="text-green-500" />
                  Items in Stock
                </span>
              }
              value={products.reduce((sum, p) => sum + p.quantity, 0)}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Products Table */}
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="flex items-center gap-2">
              <InboxOutlined className="text-blue-500" />
              Products from this Supplier
            </span>
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-64"
              allowClear
            />
          </div>
        }
        className="shadow-sm"
      >
        {filteredProducts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchText
                ? "No products match your search"
                : "No products from this supplier"
            }
          />
        ) : (
          <Table
            columns={productColumns}
            dataSource={filteredProducts}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} products`,
            }}
            scroll={{ x: "max-content" }}
            size={screens.md ? "middle" : "small"}
          />
        )}
      </Card>
    </div>
  );
};

export default SupplierDetails;
