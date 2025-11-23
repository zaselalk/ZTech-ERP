import { useState, useEffect } from "react";
import { Bookshop, Sale } from "../types";
import { Link, useParams } from "react-router-dom";
import { Card, Spin, message, Table, Typography, Button } from "antd";
import { bookshopService } from "../services";
import { formatCurrency } from "../utils";

const { Title } = Typography;

const BookshopDetails = () => {
  const { id } = useParams();
  const [bookshop, setBookshop] = useState<Bookshop | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookshopDetails = async () => {
      try {
        const bookshopResponse = await bookshopService.getBookshopById(id!);
        setBookshop(bookshopResponse);

        const salesResponse = await bookshopService.getBookshopSales(id!);
        setSales(salesResponse);
      } catch (error) {
        message.error("Failed to fetch bookshop details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookshopDetails();
  }, [id]);

  const salesColumns = [
    { title: "Sale ID", dataIndex: "id", key: "id" },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: string | number) =>
        `${formatCurrency(typeof val === "number" ? val : parseFloat(val))}`,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (val: string | number) =>
        `${formatCurrency(typeof val === "number" ? val : parseFloat(val))}`,
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, _record: Sale) => (
        <span>
          <Link to={`/bookshops/`}>
            <Button type="link">View Receipt</Button>
          </Link>
        </span>
      ),
    },
  ];

  const consignmentSales = sales.filter(
    (sale) => sale.payment_method === "Consignment"
  );

  if (loading) {
    return <Spin size="large" />;
  }

  if (!bookshop) {
    return <div>Bookshop not found</div>;
  }

  return (
    <div>
      <Card title={`Bookshop: ${bookshop.name}`}>
        <p>
          <strong>Location:</strong> {bookshop.location}
        </p>
        <p>
          <strong>Contact:</strong> {bookshop.contact}
        </p>
        <p>
          <strong>Consignment:</strong> {bookshop.consignment}
        </p>
      </Card>

      <Title level={4} style={{ marginTop: "24px" }}>
        Sales
      </Title>
      <Table columns={salesColumns} dataSource={sales} rowKey="id" />

      {(bookshop.consignment ?? 0) > 0 && (
        <>
          <Title level={4} style={{ marginTop: "24px" }}>
            Consignments
          </Title>
          <Table
            columns={salesColumns}
            dataSource={consignmentSales}
            rowKey="id"
          />
        </>
      )}
    </div>
  );
};

export default BookshopDetails;
