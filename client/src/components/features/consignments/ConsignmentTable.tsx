import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { Bookshop } from "../../../types";
import { bookshopService } from "../../../services";

interface ConsignmentTableProps {
  onRecordPayment: (bookshop: Bookshop) => void;
  refreshTrigger?: number;
}

export const ConsignmentTable = ({
  onRecordPayment,
  refreshTrigger,
}: ConsignmentTableProps) => {
  const [bookshops, setBookshops] = useState<Bookshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookshops();
  }, [refreshTrigger]);

  const fetchBookshops = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await bookshopService.getBookshops();
      setBookshops(data);
    } catch (error) {
      message.error("Failed to fetch bookshops");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Bookshop", dataIndex: "name", key: "name" },
    {
      title: "Consignment Amount",
      dataIndex: "consignment",
      key: "consignment",
      render: (amount: number | string) => `LKR ${amount}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Bookshop) => (
        <Button type="primary" onClick={() => onRecordPayment(record)}>
          Record Payment
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={bookshops}
      rowKey="id"
      loading={loading}
    />
  );
};
