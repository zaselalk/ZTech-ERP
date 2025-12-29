import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
  Checkbox,
  Collapse,
  Space,
  Divider,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { userService } from "../services";
import {
  User,
  UserPermissions,
  ModulePermissions,
  ALL_MODULES,
  MODULE_LABELS,
  ModuleName,
  DEFAULT_PERMISSIONS,
} from "../types";

const { Title, Text } = Typography;

// Default empty module permissions
const emptyModulePermissions: ModulePermissions = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};

// Create empty permissions object
const createEmptyPermissions = (): UserPermissions => {
  const permissions = {} as UserPermissions;
  ALL_MODULES.forEach((module) => {
    permissions[module] = { ...emptyModulePermissions };
  });
  return permissions;
};

interface PermissionEditorProps {
  value?: UserPermissions | null;
  onChange?: (permissions: UserPermissions) => void;
}

const PermissionEditor = ({
  value,
  onChange,
}: PermissionEditorProps) => {
  const currentPermissions = value || DEFAULT_PERMISSIONS;

  const handleModulePermissionChange = (
    module: ModuleName,
    permission: keyof ModulePermissions,
    checked: boolean
  ) => {
    const newPermissions = {
      ...currentPermissions,
      [module]: {
        ...currentPermissions[module],
        [permission]: checked,
      },
    };
    onChange?.(newPermissions);
  };

  const handleModuleAllChange = (module: ModuleName, checked: boolean) => {
    const newPermissions = {
      ...currentPermissions,
      [module]: {
        view: checked,
        create: checked,
        edit: checked,
        delete: checked,
      },
    };
    onChange?.(newPermissions);
  };

  const handleSelectAll = (checked: boolean) => {
    const newPermissions = {} as UserPermissions;
    ALL_MODULES.forEach((module) => {
      newPermissions[module] = {
        view: checked,
        create: checked,
        edit: checked,
        delete: checked,
      };
    });
    onChange?.(newPermissions);
  };

  const isModuleAllChecked = (module: ModuleName) => {
    const perms = currentPermissions[module];
    return perms.view && perms.create && perms.edit && perms.delete;
  };

  const items = ALL_MODULES.map((module) => ({
    key: module,
    label: (
      <div className="flex items-center justify-between w-full">
        <span>{MODULE_LABELS[module]}</span>
        <Checkbox
          checked={isModuleAllChecked(module)}
          onChange={(e) => handleModuleAllChange(module, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        >
          All
        </Checkbox>
      </div>
    ),
    children: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Checkbox
          checked={currentPermissions[module].view}
          onChange={(e) =>
            handleModulePermissionChange(module, "view", e.target.checked)
          }
        >
          View
        </Checkbox>
        <Checkbox
          checked={currentPermissions[module].create}
          onChange={(e) =>
            handleModulePermissionChange(module, "create", e.target.checked)
          }
        >
          Create
        </Checkbox>
        <Checkbox
          checked={currentPermissions[module].edit}
          onChange={(e) =>
            handleModulePermissionChange(module, "edit", e.target.checked)
          }
        >
          Edit
        </Checkbox>
        <Checkbox
          checked={currentPermissions[module].delete}
          onChange={(e) =>
            handleModulePermissionChange(module, "delete", e.target.checked)
          }
        >
          Delete
        </Checkbox>
      </div>
    ),
  }));

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LockOutlined />
          <Text strong>Permissions</Text>
        </div>
        <Space>
          <Button size="small" onClick={() => handleSelectAll(true)}>
            Select All
          </Button>
          <Button size="small" onClick={() => handleSelectAll(false)}>
            Deselect All
          </Button>
        </Space>
      </div>

      <Collapse items={items} size="small" />
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
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
    setPermissions(DEFAULT_PERMISSIONS);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setPermissions(user.permissions || DEFAULT_PERMISSIONS);
    form.setFieldsValue({
      username: user.username,
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
      const userData = {
        ...values,
        permissions,
      };

      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
        message.success("User updated successfully");
      } else {
        await userService.createUser(userData);
        message.success("User created successfully");
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error("Failed to save user");
    }
  };

  const getPermissionSummary = (user: User) => {
    // Count modules with view permission
    const viewableModules = ALL_MODULES.filter(
      (module) => user.permissions?.[module]?.view
    );
    
    // Check if user has full access (all permissions enabled)
    const hasFullAccess = ALL_MODULES.every(
      (module) => 
        user.permissions?.[module]?.view &&
        user.permissions?.[module]?.create &&
        user.permissions?.[module]?.edit &&
        user.permissions?.[module]?.delete
    );

    if (hasFullAccess) {
      return <Tag color="red">Full Access</Tag>;
    }

    // Check if user has POS-only permissions (only pos module)
    const hasPosOnly = viewableModules.length === 1 && viewableModules[0] === "pos";
    
    if (hasPosOnly) {
      return <Tag color="blue">POS Only</Tag>;
    }

    return (
      <Tag color="purple">
        Custom ({viewableModules.length}/{ALL_MODULES.length} modules)
      </Tag>
    );
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
      title: "Permissions",
      key: "permissions",
      render: (_: any, record: User) => getPermissionSummary(record),
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
        width={700}
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

          <Divider />

          <PermissionEditor
            value={permissions}
            onChange={setPermissions}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
