import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { Link } from "react-router-dom";
import { Bookshop } from "../../../types";
import { formatCurrency } from "../../../utils";
import { bookshopService } from "../../../services";

interface BookshopTableProps {
  onEdit: (bookshop: Bookshop) => void;
  onDelete: (id: number) => Promise<void>;
  refreshTrigger?: number;
}

export const BookshopTable = ({
  onEdit,
  onDelete,
  refreshTrigger,
}: BookshopTableProps) => {
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

  const handleDelete = async (id: number) => {
    await onDelete(id);
    fetchBookshops();
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    {
      title: "Consignment",
      dataIndex: "consignment",
      key: "consignment",
      render: (consignment: number) => `${formatCurrency(consignment)}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Bookshop) => (
        <span>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          <Link to={`/bookshops/${record.id}`}>
            <Button type="link">View Details</Button>
          </Link>
        </span>
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
