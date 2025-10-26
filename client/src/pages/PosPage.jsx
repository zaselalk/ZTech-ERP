import { useState, useEffect, useRef } from 'react';
import { Layout, Input, Card, Row, Col, Typography, Table, Button, message, Modal, Form, Select, InputNumber, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const API_URL = 'http://localhost:5001/api';

const Receipt = ({ sale, onDone, visible }) => {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({ content: () => componentRef.current });
  
    if (!sale) return null;

    const subtotal = sale.books.reduce((acc, book) => acc + (book.SaleItem.price * book.SaleItem.quantity), 0);
  
    return (
      <Modal title="Sale Successful" visible={visible} onCancel={onDone} footer={[
          <Button key="back" onClick={onDone}>New Sale</Button>,
          <Button key="submit" type="primary" onClick={handlePrint}>Print Receipt</Button>,
      ]}>
          <div ref={componentRef} style={{padding: 20}}>
              <Title level={4}>Receipt - Sale #{sale.id}</Title>
              {sale.bookshop && <><Text><strong>Bookshop:</strong> {sale.bookshop.name}</Text><br/></>}
              <Text><strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}</Text><br/>
              <Text><strong>Payment Method:</strong> {sale.payment_method}</Text>
              <Divider />
              <Table 
                  dataSource={sale.books}
                  columns={[
                      { title: 'Item', dataIndex: 'name', key: 'name' },
                      { title: 'Qty', dataIndex: ['SaleItem', 'quantity'], key: 'quantity' },
                      { title: 'Price', dataIndex: ['SaleItem', 'price'], key: 'price', render: (val) => `LKR ${parseFloat(val).toFixed(2)}` },
                      { title: 'Total', key: 'total', render: (_, record) => `LKR ${(record.SaleItem.price * record.SaleItem.quantity).toFixed(2)}`}
                  ]}
                  pagination={false}
                  size="small"
              />
              <div style={{textAlign: 'right', marginTop: 16}}>
                  <Text>Subtotal: LKR {subtotal.toFixed(2)}</Text><br/>
                  <Text>Discount: LKR {parseFloat(sale.discount).toFixed(2)}</Text><br/>
                  <Title level={5}>Total: LKR {parseFloat(sale.total_amount).toFixed(2)}</Title>
              </div>
          </div>
      </Modal>
    );
};

const PosPage = () => {
    const [topSellers, setTopSellers] = useState([]);
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { fetchTopSellers(); }, []);

    const fetchTopSellers = async () => {
        try {
            const res = await fetch(`${API_URL}/books/top-sellers`);
            setTopSellers(await res.json());
        } catch (e) { message.error("Failed to load top sellers"); }
    }

    const handleAddToCart = (book) => {
        const existing = cart.find(item => item.id === book.id);
        if (existing) {
            setCart(cart.map(item => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...book, quantity: 1 }]);
        }
    };

    const handleQuantityChange = (bookId, quantity) => {
        setCart(cart.map(item => item.id === bookId ? { ...item, quantity } : item).filter(item => item.quantity > 0));
    }

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = Math.max(0, subtotal - discount);

    const cartColumns = [
        { title: 'Book', dataIndex: 'name', key: 'name' },
        { title: 'Price', dataIndex: 'price', key: 'price', render: (val) => `LKR ${val}` },
        { title: 'Qty', dataIndex: 'quantity', key: 'quantity', render: (text, record) => 
            <InputNumber size="small" min={0} value={text} onChange={(val) => handleQuantityChange(record.id, val)} />
        },
        { title: 'Subtotal', key: 'subtotal', render: (_, record) => `LKR ${(record.price * record.quantity).toFixed(2)}`}
    ];

    const resetSale = () => {
        setCart([]);
        setDiscount(0);
        setIsCheckoutVisible(false);
        setCompletedSale(null);
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>Point of Sale</Title>
                <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
            </Header>
            <Layout>
                <Content style={{ padding: '24px' }}>
                    <Search placeholder="Search for books..." style={{ marginBottom: 24 }} />
                    <Row gutter={[16, 16]}>
                        {topSellers.map(book => (
                            <Col key={book.id} span={6}>
                                <Card hoverable onClick={() => handleAddToCart(book)}>
                                    <Card.Meta title={book.name} description={`LKR ${book.price}`} />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Content>
                <Sider width={400} theme="light" style={{ padding: '24px', borderLeft: '1px solid #f0f0f0' }}>
                    <Title level={4}>Cart</Title>
                    <Table columns={cartColumns} dataSource={cart} rowKey="id" pagination={false} size="small" />
                    <div style={{textAlign: 'right', marginTop: 24}}>
                        <Text strong>Subtotal: LKR {subtotal.toFixed(2)}</Text>
                        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8}}>
                            <Text strong style={{marginRight: 8}}>Discount:</Text>
                            <InputNumber value={discount} onChange={setDiscount} min={0} max={subtotal} />
                        </div>
                        <Title level={4} style={{marginTop: 8}}>Total: LKR {total.toFixed(2)}</Title>
                    </div>
                    <Button type="primary" block size="large" disabled={cart.length === 0} onClick={() => setIsCheckoutVisible(true)} style={{ marginTop: 24 }}>
                        Checkout
                    </Button>
                </Sider>
            </Layout>
            {isCheckoutVisible && <CheckoutModal visible={isCheckoutVisible} onClose={() => setIsCheckoutVisible(false)} cart={cart} total={total} discount={discount} onSaleComplete={(sale) => { setIsCheckoutVisible(false); setCompletedSale(sale); }} />}
            {completedSale && <Receipt sale={completedSale} visible={!!completedSale} onDone={resetSale} />}
        </Layout>
    );
}

const CheckoutModal = ({ visible, onClose, cart, total, discount, onSaleComplete }) => {
    const [form] = Form.useForm();
    const [bookshops, setBookshops] = useState([]);

    useEffect(() => { if(visible) fetchBookshops(); }, [visible]);

    const fetchBookshops = async () => { try { const res = await fetch(`${API_URL}/bookshops`); setBookshops(await res.json()); } catch (e) { message.error('Failed to fetch bookshops'); } };

    const handleFinalizeSale = async () => {
        try {
          const values = await form.validateFields();
          const saleData = { ...values, items: cart.map(({ id, quantity }) => ({ BookId: id, quantity })), discount };
    
          const response = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData),
          });
    
          if (response.ok) {
            const newSale = await response.json();
            message.success('Sale created successfully');
            onSaleComplete(newSale);
          } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create sale');
          }
        } catch (error) { message.error(error.message); }
      };

    return (
        <Modal title="Finalize Sale" visible={visible} onOk={handleFinalizeSale} onCancel={onClose}>
            <Form form={form} layout="vertical">
                <PaymentForm form={form} total={total} bookshops={bookshops} />
            </Form>
        </Modal>
    )
}

const PaymentForm = ({ form, total, bookshops }) => {
    const paymentMethod = Form.useWatch('payment_method', form);
    const [amountTendered, setAmountTendered] = useState(0);
    const change = amountTendered - total;

    return (
        <>
            <Title level={4}>Total Due: LKR {total.toFixed(2)}</Title>
            <Form.Item name="BookshopId" label="Bookshop" rules={[{ required: true }]}>
                <Select placeholder="Select a bookshop">
                    {bookshops.map(shop => (
                        <Option key={shop.id} value={shop.id}>{shop.name}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item name="payment_method" label="Payment Method" rules={[{ required: true }]}>
                <Select placeholder="Select a payment method">
                    <Option value="Cash">Cash</Option>
                    <Option value="Card">Card</Option>
                </Select>
            </Form.Item>
            {paymentMethod === 'Cash' && (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Amount Tendered">
                            <InputNumber min={total} style={{width: '100%'}} value={amountTendered} onChange={setAmountTendered} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Title level={5} style={{paddingTop: 30}}>Change: LKR {change > 0 ? change.toFixed(2) : '0.00'}</Title>
                    </Col>
                </Row>
            )}
        </>
    )
}

export default PosPage;
