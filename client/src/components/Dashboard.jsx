import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Typography, message } from 'antd';
import { DollarCircleOutlined, ShoppingCartOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const API_URL = 'http://localhost:5001/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSalesToday: 0,
    totalSalesWeek: 0,
    lowStockCount: 0,
    recentSales: [],
  });

  useEffect(() => {
    fetchStats();
  }, []); // Refetch when refreshKey changes

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      message.error('Failed to fetch dashboard stats');
    }
  };

  const recentSalesColumns = [
    { title: 'Sale ID', dataIndex: 'id', key: 'id' },
    { title: 'Bookshop', dataIndex: ['bookshop', 'name'], key: 'bookshop' },
    { title: 'Amount', dataIndex: 'total_amount', key: 'total_amount', render: (val) => `LKR ${val}` },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Row gutter={16} style={{ marginBottom: 32 }}>
        <Col span={8}>
          <Card>
            <DollarCircleOutlined style={{ fontSize: 24, float: 'right' }} />
            <Text>Total Sales (Today)</Text>
            <Title level={3}>LKR {stats.totalSalesToday.toFixed(2)}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <ShoppingCartOutlined style={{ fontSize: 24, float: 'right' }} />
            <Text>Total Sales (Week)</Text>
            <Title level={3}>LKR {stats.totalSalesWeek.toFixed(2)}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <WarningOutlined style={{ fontSize: 24, float: 'right' }} />
            <Text>Low Stock Items</Text>
            <Title level={3}>{stats.lowStockCount}</Title>
          </Card>
        </Col>
      </Row>

      <Title level={3}>Recent Transactions</Title>
      <Table
        columns={recentSalesColumns}
        dataSource={stats.recentSales}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export default Dashboard;

