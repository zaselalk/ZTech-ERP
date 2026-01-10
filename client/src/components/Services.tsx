import { useState, useEffect } from "react";
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
  Table,
  Tag,
  Space,
  Modal,
  InputNumber,
  Select,
  Switch,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  ToolOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  BarcodeOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { serviceService, settingsService } from "../services";
import type { Service } from "../services/serviceService";
import { formatCurrency } from "../utils";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchText, setSearchText] = useState("");
  const [enableProfitTracking, setEnableProfitTracking] = useState(false);
  const [enableCategoryManagement, setEnableCategoryManagement] =
    useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalCategories: 0,
  });

  useEffect(() => {
    fetchServices();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      setEnableProfitTracking(settings.enableProfitTracking ?? false);
      setEnableCategoryManagement(settings.enableCategoryManagement ?? false);
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getServices();
      setServices(data);

      // Calculate stats
      const activeServices = data.filter((s) => s.isActive).length;
      const categories = new Set(data.map((s) => s.category).filter(Boolean));
      setStats({
        totalServices: data.length,
        activeServices,
        totalCategories: categories.size,
      });
    } catch (error) {
      message.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (service: Service | null = null) => {
    setEditingService(service);
    if (service) {
      form.setFieldsValue({
        ...service,
        price: parseFloat(service.price?.toString() || "0"),
        cost_price: service.cost_price
          ? parseFloat(service.cost_price.toString())
          : undefined,
        discount: service.discount
          ? parseFloat(service.discount.toString())
          : 0,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        discount: 0,
        discount_type: "Percentage",
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingService(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const sanitizedValues = {
        ...values,
        code: values.code || null,
        description: values.description || null,
        category: values.category || null,
        cost_price: values.cost_price || null,
        duration: values.duration || null,
      };

      if (editingService) {
        await serviceService.updateService(editingService.id, sanitizedValues);
        message.success("Service updated successfully");
      } else {
        await serviceService.createService(sanitizedValues);
        message.success("Service created successfully");
      }

      fetchServices();
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await serviceService.deleteService(id);
      message.success("Service deleted successfully");
      fetchServices();
    } catch (error) {
      message.error("Failed to delete service");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await serviceService.toggleServiceStatus(id);
      message.success("Service status updated");
      fetchServices();
    } catch (error) {
      message.error("Failed to update service status");
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchText.toLowerCase()) ||
      service.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Service> = [
    {
      title: "Service",
      key: "service",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{record.name}</span>
          {record.code && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <BarcodeOutlined /> {record.code}
            </span>
          )}
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    ...(enableCategoryManagement
      ? [
          {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (category: string) =>
              category ? (
                <Tag color="purple">{category}</Tag>
              ) : (
                <span className="text-gray-400">—</span>
              ),
          },
        ]
      : []),
    ...(enableProfitTracking
      ? [
          {
            title: "Cost",
            dataIndex: "cost_price",
            key: "cost_price",
            render: (cost_price: number | null) =>
              cost_price ? (
                <span className="text-gray-700">
                  {formatCurrency(parseFloat(cost_price.toString()))}
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              ),
          },
        ]
      : []),
    {
      title: enableProfitTracking ? "Selling Price" : "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(parseFloat(price?.toString() || "0"))}
        </span>
      ),
      sorter: (a, b) => Number(a.price) - Number(b.price),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number | null) =>
        duration ? (
          <span className="flex items-center gap-1 text-gray-600">
            <ClockCircleOutlined /> {duration} min
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag
          color={isActive ? "green" : "red"}
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.isActive ? "Deactivate" : "Activate"}>
            <Button
              type="text"
              icon={
                record.isActive ? (
                  <CloseCircleOutlined className="text-orange-500" />
                ) : (
                  <CheckCircleOutlined className="text-green-500" />
                )
              }
              onClick={() => handleToggleStatus(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              className="text-blue-500 hover:text-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this service?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-red-500 hover:text-red-600"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={2} className="mb-1! text-2xl! sm:text-3xl!">
            Services
          </Title>
          <Text className="text-gray-500">Manage your service offerings</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
          className="w-full sm:w-auto"
        >
          Add Service
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={enableCategoryManagement ? 8 : 12}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Services
                </span>
              }
              value={stats.totalServices}
              prefix={<ToolOutlined className="text-purple-500" />}
              valueStyle={{ color: "#722ed1", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={enableCategoryManagement ? 8 : 12}>
          <Card
            className="hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  Active Services
                </span>
              }
              value={stats.activeServices}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a", fontWeight: 600 }}
            />
          </Card>
        </Col>
        {enableCategoryManagement && (
          <Col xs={12} sm={8}>
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
                prefix={<TagsOutlined className="text-blue-500" />}
                valueStyle={{ color: "#1890ff", fontWeight: 600 }}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* Services Table Card */}
      <Card
        className="shadow-sm"
        styles={{ body: { padding: "16px sm:24px" } }}
      >
        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <Input
            placeholder="Search services by name, code, category..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:max-w-md"
            allowClear
            size="large"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchServices}
            className="w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      {/* Service Form Modal */}
      <Modal
        title={
          <Space>
            <ToolOutlined className="text-purple-500" />
            <span>{editingService ? "Edit Service" : "Add New Service"}</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        centered
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Service Name"
                rules={[
                  { required: true, message: "Please enter service name" },
                ]}
              >
                <Input
                  prefix={<ToolOutlined className="text-gray-400" />}
                  placeholder="e.g., Repair Service"
                  maxLength={100}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="code" label="Service Code">
                <Input
                  prefix={<BarcodeOutlined className="text-gray-400" />}
                  placeholder="e.g., SRV-001"
                  maxLength={50}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={2}
              placeholder="Brief description of the service"
              maxLength={500}
            />
          </Form.Item>

          {enableCategoryManagement && (
            <Form.Item name="category" label="Category">
              <Input placeholder="e.g., Repair, Consultation, Installation" />
            </Form.Item>
          )}

          <Row gutter={16}>
            {enableProfitTracking && (
              <Col span={8}>
                <Form.Item name="cost_price" label="Cost Price">
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
              </Col>
            )}
            <Col span={enableProfitTracking ? 8 : 12}>
              <Form.Item
                name="price"
                label={enableProfitTracking ? "Selling Price" : "Price"}
                rules={[{ required: true, message: "Please enter price" }]}
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
            </Col>
            <Col span={enableProfitTracking ? 8 : 12}>
              <Form.Item name="duration" label="Duration (minutes)">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="e.g., 60"
                  prefix={<ClockCircleOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="discount"
                label="Default Discount"
                initialValue={0}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                  addonAfter={
                    <Form.Item
                      name="discount_type"
                      noStyle
                      initialValue="Percentage"
                    >
                      <Select style={{ width: 90 }}>
                        <Select.Option value="Fixed">Rs.</Select.Option>
                        <Select.Option value="Percentage">%</Select.Option>
                      </Select>
                    </Form.Item>
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isActive"
                label="Status"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Services;
