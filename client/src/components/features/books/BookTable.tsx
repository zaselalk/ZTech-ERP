import { useState, useEffect } from "react";
import { Table, Button, Input, message } from "antd";
import { Link } from "react-router-dom";
import { Book } from "../../../types";
import { formatCurrency } from "../../../utils";
import { bookService } from "../../../services";

interface BookTableProps {
  onEdit: (book: Book) => void;
  onDelete: (id: number) => Promise<void>;
  onAdd: () => void;
  refreshTrigger?: number;
}

export const BookTable = ({
  onEdit,
  onDelete,
  onAdd,
  refreshTrigger,
}: BookTableProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, [refreshTrigger]);

  const fetchBooks = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await bookService.getBooks();
      setBooks(data);
    } catch (error) {
      message.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await onDelete(id);
    fetchBooks();
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Author", dataIndex: "author", key: "author" },
    { title: "Genre", dataIndex: "genre", key: "genre" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number | string) =>
        `${formatCurrency(
          typeof price === "number" ? price : parseFloat(price)
        )}`,
    },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Book) => (
        <span>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          <Link to={`/books/${record.id}`}>
            <Button type="link">View Details</Button>
          </Link>
        </span>
      ),
    },
  ];

  const filteredBooks = books.filter((book) =>
    Object.values(book).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          placeholder="Search books..."
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={onAdd}>
          Add Book
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredBooks}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};
