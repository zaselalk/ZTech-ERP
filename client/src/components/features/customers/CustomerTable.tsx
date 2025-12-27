import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { Link } from "react-router-dom";
import { Customer } from "../../../types";
import { formatCurrency } from "../../../utils";
import { customerService } from "../../../services";

interface CustomerTableProps {
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => Promise<void>;
  refreshTrigger?: number;
}

export const CustomerTable = ({
  onEdit,
  onDelete,
  refreshTrigger,
}: CustomerTableProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: number) => {
    await onDelete(id);
    fetchCustomers();
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Credit Balance",
      dataIndex: "credit_balance",
      key: "credit_balance",
      render: (credit_balance: number) => `${formatCurrency(credit_balance)}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Customer) => (
        <span>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          <Link to={`/customers/${record.id}`}>
            <Button type="link">View Details</Button>
          </Link>
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={customers}
      rowKey="id"
      loading={loading}
    />
  );
};
