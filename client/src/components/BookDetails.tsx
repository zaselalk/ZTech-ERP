import { formatCurrency } from "../utils";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin, message, Table, Typography, Button } from "antd";
import { bookService } from "../services";
import { Book, Sale } from "../types";
import ReceiptModal from "./ReceiptModal";

const { Title } = Typography;

interface ExtendedBook extends Book {
  genre?: string | null;
  quantity?: number;
  price: number;
  author?: string | null;
  name: string;
}

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState<ExtendedBook | null>(null);
  const [stats, setStats] = useState<{
    totalSales: number;
    topBookshops: Array<{
      bookshop: { id: number; name: string };
      total_quantity: number;
      date: string;
    }>;
  }>({
    totalSales: 0,
    topBookshops: [],
  });
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const bookResponse = await bookService.getBookById(id!);
        setBook(bookResponse);
        const statsResponse = await bookService.getBookStats(id!);
        setStats(statsResponse);
        const salesResponse = await bookService.getBookSales(id!);
        setSales(salesResponse);
      } catch (error) {
        message.error("Failed to fetch book details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const topBookshopsColumns: Array<{
    title: string;
    dataIndex: string | string[];
    key: string;
    render?: (text: string) => string;
  }> = [
    {
      title: "Bookshop Name",
      dataIndex: ["bookshop", "name"],
      key: "bookshop_name",
    },
    {
      title: "Total Quantity",
      dataIndex: "total_quantity",
      key: "total_quantity",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ];

  const salesColumns = [
    { title: "Sale ID", dataIndex: "id", key: "id" },
    { title: "Bookshop", dataIndex: ["bookshop", "name"], key: "bookshop" },
    {
      title: "Quantity",
      key: "quantity",
      render: (_: unknown, record: Sale) => {
        const bookItem = record.books.find((b) => b.id === Number(id));
        return bookItem?.SaleItem?.quantity || 0;
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Sale) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedSaleId(record.id);
            setIsReceiptModalVisible(true);
          }}
        >
          View Receipt
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (!book) {
    return <div>Book not found</div>;
  }

  return (
    <div>
      <Card title={`Book: ${book.name}`}>
        <p>
          <strong>Barcode:</strong> {book.barcode}
        </p>
        <p>
          <strong>Author:</strong> {book.author}
        </p>
        <p>
          <strong>Genre:</strong> {book.genre}
        </p>
        <p>
          <strong>Price:</strong> {formatCurrency(book.price)}
        </p>
        <p>
          <strong>Quantity:</strong> {book.quantity}
        </p>
        <p>
          <strong>Total Sales:</strong> {stats.totalSales}
        </p>
      </Card>

      <Title level={4} style={{ marginTop: "24px" }}>
        Bookshops Sales
      </Title>
      <Table
        columns={topBookshopsColumns}
        dataSource={stats.topBookshops}
        rowKey={(record) => record.bookshop.id}
      />

      <Title level={4} style={{ marginTop: "24px" }}>
        Recent Sales
      </Title>
      <Table columns={salesColumns} dataSource={sales} rowKey="id" />

      <ReceiptModal
        saleId={selectedSaleId}
        visible={isReceiptModalVisible}
        onClose={() => setIsReceiptModalVisible(false)}
      />
    </div>
  );
};

export default BookDetails;
