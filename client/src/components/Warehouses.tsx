import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  message,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Table,
  Modal,
  Popconfirm,
  Space,
  Tooltip,
  Tag,
  InputNumber,
  Switch,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  warehouseService,
  type Warehouse,
  type WarehouseFormData,
} from "../services/warehouseService";
import { usePermissions } from "../hooks/usePermissions";

const { Title, Text, Link } = Typography;
const { TextArea } = Input;

const Warehouses = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [form] = Form.useForm();
  const { canCreate, canEdit, canDelete } = usePermissions();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await warehouseService.getWarehouses();
      setWarehouses(data);
    } catch (error: any) {
      // If warehouse management is disabled, show a friendly message
      if (error.response?.status === 403) {
        message.info("Warehouse management is not enabled");
      } else {
        message.error("Failed to fetch warehouses");
      }
    } finally {
      setLoading(false);
    }
  };

  const showModal = (warehouse: Warehouse | null = null): void => {
    setEditingWarehouse(warehouse);
    if (warehouse) {
      form.setFieldsValue(warehouse);
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingWarehouse(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      const warehouseData: WarehouseFormData = {
        name: values.name,
        code: values.code,
        location: values.location,
        address: values.address,
        contactPerson: values.contactPerson,
        phone: values.phone,
        email: values.email,
        capacity: values.capacity,
        notes: values.notes,
        isActive: values.isActive,
      };

      if (editingWarehouse) {
        await warehouseService.updateWarehouse(
          editingWarehouse.id,
          warehouseData
        );
        message.success("Warehouse updated successfully");
      } else {
        await warehouseService.createWarehouse(warehouseData);
        message.success("Warehouse created successfully");
      }

      fetchWarehouses();
      handleCancel();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(
        error.response?.data?.message || "Failed to save warehouse"
      );
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await warehouseService.deleteWarehouse(id);
      message.success("Warehouse deleted successfully");
      fetchWarehouses();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to delete warehouse"
      );
    }
  };

  const handleToggleActive = async (id: number): Promise<void> => {
    try {
      await warehouseService.toggleWarehouseActive(id);
      message.success("Warehouse status updated");
      fetchWarehouses();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to update warehouse status"
      );
    }
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      warehouse.name.toLowerCase().includes(searchLower) ||
      warehouse.code?.toLowerCase().includes(searchLower) ||
      warehouse.location?.toLowerCase().includes(searchLower) ||
      warehouse.contactPerson?.toLowerCase().includes(searchLower) ||
      warehouse.phone?.toLowerCase().includes(searchLower) ||
      warehouse.email?.toLowerCase().includes(searchLower);

    if (showActiveOnly) {
      return matchesSearch && warehouse.isActive;
    }
    return matchesSearch;
  });

  const activeWarehouses = warehouses.filter((w) => w.isActive).length;
  const inactiveWarehouses = warehouses.length - activeWarehouses;

  const columns: ColumnsType<Warehouse> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Warehouse) => (
        <Link
          strong
          onClick={() => navigate(`/warehouses/${record.id}`)}
          className="cursor-pointer"
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text: string) =>
        text ? (
          <span>
            <BarcodeOutlined className="mr-1" />
            {text}
          </span>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (text: string) =>
        text ? (
          <span>
            <EnvironmentOutlined className="mr-1" />
            {text}
          </span>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
      render: (text: string) =>
        text ? (
          <span>
            <UserOutlined className="mr-1" />
            {text}
          </span>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text: string) =>
        text ? (
          <span>
            <PhoneOutlined className="mr-1" />
            {text}
          </span>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity: number | null) =>
        capacity ? (
          <span>{capacity.toLocaleString()}</span>
        ) : (
          <Text type="secondary">-</Text>
        ),
      sorter: (a, b) => (a.capacity || 0) - (b.capacity || 0),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Warehouse) => (
        <Space size="small">
          {canEdit("warehouses") && (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => showModal(record)}
              />
            </Tooltip>
          )}
          {canEdit("warehouses") && (
            <Tooltip title={record.isActive ? "Deactivate" : "Activate"}>
              <Popconfirm
                title={
                  record.isActive
                    ? "Deactivate this warehouse?"
                    : "Activate this warehouse?"
                }
                onConfirm={() => handleToggleActive(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  className={
                    record.isActive ? "text-orange-500" : "text-green-500"
                  }
                >
                  {record.isActive ? "Deactivate" : "Activate"}
                </Button>
              </Popconfirm>
            </Tooltip>
          )}
          {canDelete("warehouses") && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this warehouse?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Title level={2} className="!mb-0">
          <HomeOutlined className="mr-2" />
          Warehouses
        </Title>
        {canCreate("warehouses") && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Warehouse
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Warehouses"
              value={warehouses.length}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Warehouses"
              value={activeWarehouses}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Inactive Warehouses"
              value={inactiveWarehouses}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Input
            placeholder="Search warehouses..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
            allowClear
          />
          <div className="flex gap-4 items-center">
            <span className="text-gray-500">Show active only:</span>
            <Switch checked={showActiveOnly} onChange={setShowActiveOnly} />
            <Button icon={<ReloadOutlined />} onClick={fetchWarehouses}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Warehouses Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredWarehouses}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} warehouses`,
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        okText={editingWarehouse ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Warehouse Name"
                rules={[
                  { required: true, message: "Please enter warehouse name" },
                ]}
              >
                <Input placeholder="Main Warehouse" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Warehouse Code"
                rules={[
                  {
                    pattern: /^[A-Za-z0-9-_]+$/,
                    message: "Code can only contain letters, numbers, - and _",
                  },
                ]}
              >
                <Input placeholder="WH-001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="Location">
                <Input
                  placeholder="City or Area"
                  prefix={<EnvironmentOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacity" label="Capacity (units)">
                <InputNumber placeholder="1000" className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Full Address">
            <TextArea rows={2} placeholder="Full warehouse address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactPerson" label="Contact Person">
                <Input placeholder="John Doe" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="0771234567" prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Please enter a valid email" }]}
          >
            <Input
              placeholder="warehouse@example.com"
              prefix={<MailOutlined />}
            />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea
              rows={3}
              placeholder="Additional notes about this warehouse"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Warehouses;
