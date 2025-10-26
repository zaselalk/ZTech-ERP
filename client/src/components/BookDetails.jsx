import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, message, Table, Typography } from 'antd';

const { Title } = Typography;
const API_URL = 'http://localhost:5001/api';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [stats, setStats] = useState({ totalSales: 0, topBookshops: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const bookResponse = await fetch(`${API_URL}/books/${id}`);
        const bookData = await bookResponse.json();
        setBook(bookData);

        const statsResponse = await fetch(`${API_URL}/books/${id}/stats`);
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        message.error('Failed to fetch book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const topBookshopsColumns = [
    { title: 'Bookshop Name', dataIndex: ['bookshop', 'name'], key: 'bookshop_name' },
    { title: 'Total Quantity', dataIndex: 'total_quantity', key: 'total_quantity' },
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
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Genre:</strong> {book.genre}</p>
        <p><strong>Price:</strong> {book.price}</p>
        <p><strong>Quantity:</strong> {book.quantity}</p>
        <p><strong>Total Sales:</strong> {stats.totalSales}</p>
      </Card>

      <Title level={4} style={{ marginTop: '24px' }}>Top Bookshops</Title>
      <Table
        columns={topBookshopsColumns}
        dataSource={stats.topBookshops}
        rowKey={(record) => record.bookshop.id}
      />
    </div>
  );
};

export default BookDetails;
