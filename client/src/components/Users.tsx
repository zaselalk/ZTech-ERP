import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { userService } from "../services";
import { User } from "../types";

const { Title } = Typography;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      role: user.role,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.deleteUser(id);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error("Failed to delete user");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userService.updateUser(editingUser.id, values);
        message.success("User updated successfully");
      } else {
        await userService.createUser(values);
        message.success("User created successfully");
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error("Failed to save user");
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text: string) => (
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          {text}
        </span>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <span>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          {record.role !== "admin" && (
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          User Management
        </Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={handleAdd}>
          Add User
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm rounded-lg">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter a username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: !editingUser, message: "Please enter a password" },
            ]}
            help={
              editingUser
                ? "Leave blank to keep current password"
                : "Required for new users"
            }
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
            initialValue="staff"
          >
            <Select>
              <Option value="staff">Staff</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
