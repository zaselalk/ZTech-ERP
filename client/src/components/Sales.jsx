import { useState, useEffect } from 'react';
import { Table, Typography, message, Row, Col, Card, DatePicker, Select } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const API_URL = 'http://localhost:5001/api';

const Sales = ({ refreshKey }) => {
  const [sales, setSales] = useState([]);
  const [chartData, setChartData] = useState({
    dailySales: [],
    monthlySales: [],
    bookshopSales: [],
    paymentMethods: [],
  });

  useEffect(() => {
    fetchSales();
    processChartData();
  }, [refreshKey]); // Refetch when the refreshKey changes

  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_URL}/sales`);
      const salesData = await response.json();
      setSales(salesData);
      processChartData(salesData);
    } catch (e) {
      message.error('Failed to fetch sales');
    }
  };

  const processChartData = (salesData = sales) => {
    if (!salesData || salesData.length === 0) return;

    // Process daily sales for line chart
    const dailySalesMap = {};
    const bookshopSalesMap = {};
    const paymentMethodsMap = {};

    salesData.forEach(sale => {
      const date = new Date(sale.createdAt).toLocaleDateString();
      const amount = parseFloat(sale.total_amount);
      const bookshop = sale.bookshop?.name || 'Unknown';
      const paymentMethod = sale.payment_method || 'Cash';

      // Daily sales
      dailySalesMap[date] = (dailySalesMap[date] || 0) + amount;

      // Bookshop sales
      bookshopSalesMap[bookshop] = (bookshopSalesMap[bookshop] || 0) + amount;

      // Payment methods
      paymentMethodsMap[paymentMethod] = (paymentMethodsMap[paymentMethod] || 0) + amount;
    });

    // Convert to array format for charts
    const dailySales = Object.entries(dailySalesMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7); // Last 7 days

    const bookshopSales = Object.entries(bookshopSalesMap);
    const paymentMethods = Object.entries(paymentMethodsMap);

    setChartData({
      dailySales,
      bookshopSales,
      paymentMethods,
    });
  };

  const salesColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Bookshop', dataIndex: ['bookshop', 'name'], key: 'bookshop' },
    { title: 'Total Amount', dataIndex: 'total_amount', key: 'total_amount', render: (val) => `LKR ${parseFloat(val).toFixed(2)}` },
    { title: 'Payment', dataIndex: 'payment_method', key: 'payment_method' },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (val) => new Date(val).toLocaleDateString() },
  ];

  // Chart configurations
  const dailySalesChartData = {
    labels: chartData.dailySales.map(([date]) => date),
    datasets: [
      {
        label: 'Daily Sales (LKR)',
        data: chartData.dailySales.map(([, amount]) => amount),
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const bookshopSalesChartData = {
    labels: chartData.bookshopSales.map(([name]) => name),
    datasets: [
      {
        label: 'Sales by Bookshop (LKR)',
        data: chartData.bookshopSales.map(([, amount]) => amount),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(6, 214, 160, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(255, 149, 0, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const paymentMethodsChartData = {
    labels: chartData.paymentMethods.map(([method]) => method),
    datasets: [
      {
        data: chartData.paymentMethods.map(([, amount]) => amount),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `LKR ${value}`,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: LKR ${context.parsed}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ 
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Title level={2} style={{ 
            color: '#2c3e50',
            marginBottom: '8px',
            fontSize: '28px',
            fontWeight: '700'
          }}>
            Sales Analytics
          </Title>
          <Text style={{ 
            fontSize: '16px', 
            color: '#7f8c8d'
          }}>
            Comprehensive sales data and insights
          </Text>
        </div>
      </div>

      {/* Charts Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Daily Sales Trend" 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            headStyle={{ 
              borderBottom: '1px solid #f0f0f0',
              padding: '16px 24px'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ height: '300px' }}>
              {chartData.dailySales.length > 0 ? (
                <Line data={dailySalesChartData} options={chartOptions} />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: '#999'
                }}>
                  No sales data available
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Payment Methods" 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            headStyle={{ 
              borderBottom: '1px solid #f0f0f0',
              padding: '16px 24px'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ height: '300px' }}>
              {chartData.paymentMethods.length > 0 ? (
                <Doughnut data={paymentMethodsChartData} options={doughnutOptions} />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: '#999'
                }}>
                  No payment data available
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Sales by Bookshop" 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            headStyle={{ 
              borderBottom: '1px solid #f0f0f0',
              padding: '16px 24px'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ height: '300px' }}>
              {chartData.bookshopSales.length > 0 ? (
                <Bar 
                  data={bookshopSalesChartData} 
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `LKR ${value}`,
                        },
                      },
                    },
                  }} 
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: '#999'
                }}>
                  No bookshop data available
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Sales Summary" 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            headStyle={{ 
              borderBottom: '1px solid #f0f0f0',
              padding: '16px 24px'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ height: '300px', overflow: 'auto' }}>
              {sales.length > 0 ? (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '16px' }}>Total Sales</Text>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginTop: '4px' }}>
                      LKR {sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '16px' }}>Total Transactions</Text>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06d6a0', marginTop: '4px' }}>
                      {sales.length}
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '16px' }}>Average Sale</Text>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginTop: '4px' }}>
                      LKR {(sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0) / sales.length).toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: '#999'
                }}>
                  No sales data available
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sales Table */}
      <Card 
        title="Sales History" 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: 'none'
        }}
        headStyle={{ 
          borderBottom: '1px solid #f0f0f0',
          padding: '16px 24px'
        }}
        bodyStyle={{ padding: '0' }}
      >
        <Table 
          columns={salesColumns} 
          dataSource={sales} 
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>
    </div>
  );
};

export default Sales;