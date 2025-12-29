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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  supplierService,
  type Supplier,
  type SupplierFormData,
} from "../services/supplierService";
import { usePermissions } from "../hooks/usePermissions";

const { Title, Text, Link } = Typography;
const { TextArea } = Input;

const Suppliers = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const { canCreate, canEdit, canDelete } = usePermissions();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
    } catch (error: any) {
      // If supplier management is disabled, show a friendly message
      if (error.response?.status === 403) {
        message.info("Supplier management is not enabled");
      } else {
        message.error("Failed to fetch suppliers");
      }
    } finally {
      setLoading(false);
    }
  };

  const showModal = (supplier: Supplier | null = null): void => {
    setEditingSupplier(supplier);
    if (supplier) {
      form.setFieldsValue(supplier);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSupplier(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      const supplierData: SupplierFormData = {
        name: values.name,
        contactPerson: values.contactPerson,
        phone: values.phone,
        email: values.email,
        address: values.address,
        notes: values.notes,
      };

      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, supplierData);
        message.success("Supplier updated successfully");
      } else {
        await supplierService.createSupplier(supplierData);
        message.success("Supplier created successfully");
      }

      fetchSuppliers();
      handleCancel();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(error.response?.data?.message || "Failed to save supplier");
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await supplierService.deleteSupplier(id);
      message.success("Supplier deleted successfully");
      fetchSuppliers();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to delete supplier"
      );
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchLower = searchText.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(searchLower) ||
      supplier.contactPerson?.toLowerCase().includes(searchLower) ||
      supplier.phone?.toLowerCase().includes(searchLower) ||
      supplier.email?.toLowerCase().includes(searchLower)
    );
  });

  const columns: ColumnsType<Supplier> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Supplier) => (
        <Link
          strong
          onClick={() => navigate(`/suppliers/${record.id}`)}
          className="cursor-pointer"
        >
          {text}
        </Link>
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
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) =>
        text ? (
          <Tooltip title={text}>
            <span>
              <MailOutlined className="mr-1" />
              {text.length > 25 ? `${text.substring(0, 25)}...` : text}
            </span>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      responsive: ["lg"],
      render: (text: string) =>
        text ? (
          <Tooltip title={text}>
            <span>
              <EnvironmentOutlined className="mr-1" />
              {text.length > 30 ? `${text.substring(0, 30)}...` : text}
            </span>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {canEdit("suppliers") && (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => showModal(record)}
              />
            </Tooltip>
          )}
          {canDelete("suppliers") && (
            <Popconfirm
              title="Delete Supplier"
              description="Are you sure you want to delete this supplier?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4">
      {/* Header Section */}
      <div className="mb-6">
        <Title level={2} className="mb-0!">
          Suppliers
        </Title>
        <Text type="secondary">
          Manage your suppliers and their information
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Suppliers"
              value={suppliers.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Bar */}
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <Input
            placeholder="Search suppliers..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-64"
            allowClear
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <Button icon={<ReloadOutlined />} onClick={fetchSuppliers}>
              Refresh
            </Button>
            {canCreate("suppliers") && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                Add Supplier
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} suppliers`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingSupplier ? "Update" : "Create"}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Supplier Name"
            rules={[
              { required: true, message: "Please enter supplier name" },
              { max: 255, message: "Name cannot exceed 255 characters" },
            ]}
          >
            <Input placeholder="Enter supplier name" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="contactPerson"
                label="Contact Person"
                rules={[
                  { max: 255, message: "Name cannot exceed 255 characters" },
                ]}
              >
                <Input
                  placeholder="Contact person name"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { max: 50, message: "Phone cannot exceed 50 characters" },
                ]}
              >
                <Input placeholder="Phone number" prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: "email", message: "Please enter a valid email" },
              { max: 255, message: "Email cannot exceed 255 characters" },
            ]}
          >
            <Input placeholder="Email address" prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[
              { max: 500, message: "Address cannot exceed 500 characters" },
            ]}
          >
            <TextArea
              rows={2}
              placeholder="Supplier address"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
            rules={[
              { max: 1000, message: "Notes cannot exceed 1000 characters" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Additional notes about this supplier"
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Suppliers;
