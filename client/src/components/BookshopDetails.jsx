import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Spin, message, Table, Typography, Button } from "antd";

import api from "../utils/api";

const { Title } = Typography;
const API_URL = "http://localhost:5001/api";

const BookshopDetails = () => {
  const { id } = useParams();
  const [bookshop, setBookshop] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookshopDetails = async () => {
      try {
        const bookshopResponse = await api.fetch(`${API_URL}/bookshops/${id}`);
        const bookshopData = await bookshopResponse.json();
        setBookshop(bookshopData);

        const salesResponse = await api.fetch(`${API_URL}/bookshops/${id}/sales`);
        const salesData = await salesResponse.json();
        setSales(salesData);
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
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: "Total Amount", dataIndex: "total_amount", key: "total_amount" },
    { title: "Discount", dataIndex: "discount", key: "discount" },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
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

      {bookshop.consignment > 0 && (
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
