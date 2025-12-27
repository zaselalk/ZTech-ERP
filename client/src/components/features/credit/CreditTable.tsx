import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { Customer } from "../../../types";
import { customerService } from "../../../services";

interface CreditTableProps {
  onRecordPayment: (customer: Customer) => void;
  refreshTrigger?: number;
}

export const CreditTable = ({
  onRecordPayment,
  refreshTrigger,
}: CreditTableProps) => {
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

  const columns = [
    { title: "Customer", dataIndex: "name", key: "name" },
    {
      title: "Credit Balance",
      dataIndex: "credit_balance",
      key: "credit_balance",
      render: (amount: number | string) => `LKR ${amount}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Customer) => (
        <Button type="primary" onClick={() => onRecordPayment(record)}>
          Record Payment
        </Button>
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
