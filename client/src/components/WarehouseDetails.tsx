import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  message,
  Typography,
  Button,
  Row,
  Col,
  Statistic,
  Tag,
  Avatar,
  Descriptions,
} from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileTextOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { warehouseService, Warehouse } from "../services/warehouseService";

const { Title, Text } = Typography;

const WarehouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouseDetails = async () => {
      try {
        const warehouseResponse = await warehouseService.getWarehouseById(id!);
        setWarehouse(warehouseResponse);
      } catch (error) {
        message.error("Failed to fetch warehouse details");
        navigate("/warehouses");
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseDetails();
  }, [id, navigate]);

  // Get initials from warehouse name for avatar
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="p-6">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/warehouses")}
          className="mb-4 px-0"
        >
          Back to Warehouses
        </Button>
        <Card>
          <Text type="secondary">Warehouse not found</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/warehouses")}
        className="mb-4 px-0"
      >
        Back to Warehouses
      </Button>

      {/* Header Card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar
            size={80}
            style={{
              backgroundColor: getAvatarColor(warehouse.name),
              fontSize: "24px",
            }}
          >
            {getInitials(warehouse.name)}
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <Title level={2} className="!mb-0">
                {warehouse.name}
              </Title>
              {warehouse.isActive ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Active
                </Tag>
              ) : (
                <Tag color="error" icon={<CloseCircleOutlined />}>
                  Inactive
                </Tag>
              )}
            </div>
            {warehouse.code && (
              <Text type="secondary" className="text-lg">
                <BarcodeOutlined className="mr-2" />
                {warehouse.code}
              </Text>
            )}
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Capacity"
              value={warehouse.capacity || "Not Set"}
              prefix={<HomeOutlined />}
              suffix={warehouse.capacity ? "units" : ""}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Status"
              value={warehouse.isActive ? "Active" : "Inactive"}
              valueStyle={{
                color: warehouse.isActive ? "#3f8600" : "#cf1322",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Location"
              value={warehouse.location || "Not Set"}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Details Card */}
      <Card title="Warehouse Information" className="mb-6">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item
            label={
              <span>
                <HomeOutlined className="mr-2" />
                Warehouse Name
              </span>
            }
          >
            {warehouse.name}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <BarcodeOutlined className="mr-2" />
                Code
              </span>
            }
          >
            {warehouse.code || <Text type="secondary">Not set</Text>}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <EnvironmentOutlined className="mr-2" />
                Location
              </span>
            }
          >
            {warehouse.location || <Text type="secondary">Not set</Text>}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <HomeOutlined className="mr-2" />
                Capacity
              </span>
            }
          >
            {warehouse.capacity ? (
              `${warehouse.capacity.toLocaleString()} units`
            ) : (
              <Text type="secondary">Not set</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <EnvironmentOutlined className="mr-2" />
                Full Address
              </span>
            }
            span={2}
          >
            {warehouse.address || <Text type="secondary">Not set</Text>}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <UserOutlined className="mr-2" />
                Contact Person
              </span>
            }
          >
            {warehouse.contactPerson || <Text type="secondary">Not set</Text>}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <PhoneOutlined className="mr-2" />
                Phone
              </span>
            }
          >
            {warehouse.phone ? (
              <a href={`tel:${warehouse.phone}`}>{warehouse.phone}</a>
            ) : (
              <Text type="secondary">Not set</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <MailOutlined className="mr-2" />
                Email
              </span>
            }
          >
            {warehouse.email ? (
              <a href={`mailto:${warehouse.email}`}>{warehouse.email}</a>
            ) : (
              <Text type="secondary">Not set</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span>
                <FileTextOutlined className="mr-2" />
                Notes
              </span>
            }
            span={2}
          >
            {warehouse.notes || <Text type="secondary">No notes</Text>}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Timestamps */}
      <Card size="small">
        <div className="flex flex-col sm:flex-row justify-between text-gray-500 text-sm">
          <span>
            Created: {new Date(warehouse.createdAt).toLocaleDateString()}
          </span>
          <span>
            Last Updated: {new Date(warehouse.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default WarehouseDetails;
