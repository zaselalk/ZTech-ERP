import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  message,
  Tag,
  Space,
  Popconfirm,
  Tooltip,
  Avatar,
  Grid,
} from "antd";
import { Link } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Customer } from "../../../types";
import { formatCurrency } from "../../../utils";
import { customerService } from "../../../services";

const { useBreakpoint } = Grid;

interface CustomerTableProps {
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => Promise<void>;
  refreshTrigger?: number;
  searchText?: string;
}

export const CustomerTable = ({
  onEdit,
  onDelete,
  refreshTrigger,
  searchText = "",
}: CustomerTableProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();

  useEffect(() => {
    fetchCustomers();
  }, [refreshTrigger]);

  const fetchCustomers = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (error) {
      message.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchText) return customers;
    const lowerSearch = searchText.toLowerCase();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(lowerSearch) ||
        c.phone?.toLowerCase().includes(lowerSearch) ||
        c.address?.toLowerCase().includes(lowerSearch)
    );
  }, [customers, searchText]);

  const handleDelete = async (id: number) => {
    await onDelete(id);
  };

  // Get initials from customer name for avatar
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

  const columns: ColumnsType<Customer> = [
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            style={{ backgroundColor: getAvatarColor(record.name || "") }}
            icon={!record.name && <UserOutlined />}
            size={screens.md ? "default" : "small"}
          >
            {record.name && getInitials(record.name)}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{record.name}</span>
            {!screens.md && record.phone && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <PhoneOutlined /> {record.phone}
              </span>
            )}
          </div>
        </div>
      ),
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      responsive: ["md"],
      render: (phone: string) =>
        phone ? (
          <span className="flex items-center gap-2 text-gray-600">
            <PhoneOutlined className="text-gray-400" />
            {phone}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      responsive: ["lg"],
      ellipsis: true,
      render: (address: string) =>
        address ? (
          <Tooltip title={address}>
            <span className="flex items-center gap-2 text-gray-600">
              <EnvironmentOutlined className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{address}</span>
            </span>
          </Tooltip>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Credit Balance",
      dataIndex: "credit_balance",
      key: "credit_balance",
      sorter: (a, b) =>
        (Number(a.credit_balance) || 0) - (Number(b.credit_balance) || 0),
      render: (credit_balance: number) => {
        const balance = Number(credit_balance) || 0;
        return (
          <Tag
            color={balance > 0 ? "orange" : "green"}
            className="font-medium px-2 py-0.5"
          >
            {formatCurrency(balance)}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "action",
      width: screens.md ? 200 : 120,
      render: (_, record) => (
        <Space size={screens.md ? "small" : "middle"} wrap>
          {screens.md ? (
            <>
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                />
              </Tooltip>
              <Popconfirm
                title="Delete Customer"
                description="Are you sure you want to delete this customer?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  />
                </Tooltip>
              </Popconfirm>
              <Link to={`/customers/${record.id}`}>
                <Tooltip title="View Details">
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    className="text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                  />
                </Tooltip>
              </Link>
            </>
          ) : (
            <Space direction="vertical" size="small" className="w-full">
              <Link to={`/customers/${record.id}`} className="w-full">
                <Button
                  type="primary"
                  size="small"
                  block
                  icon={<EyeOutlined />}
                >
                  View
                </Button>
              </Link>
              <Space size="small">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                />
                <Popconfirm
                  title="Delete Customer"
                  description="Delete this customer?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            </Space>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={filteredCustomers}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} customers`,
        responsive: true,
        size: screens.md ? "default" : "small",
      }}
      scroll={{ x: "max-content" }}
      size={screens.md ? "middle" : "small"}
      className="customer-table"
      rowClassName="hover:bg-gray-50 transition-colors"
    />
  );
};
