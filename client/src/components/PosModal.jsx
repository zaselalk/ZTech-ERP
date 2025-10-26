import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, message, AutoComplete, Steps, Typography, Row, Col, Divider } from 'antd';
import { useReactToPrint } from 'react-to-print';

const { Option } = Select;
const { Step } = Steps;
const { Title, Text } = Typography;
const API_URL = 'http://localhost:5001/api';

const Receipt = ({ sale, onDone, visible }) => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  if (!sale) return null;

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
            <Title level={5} style={{textAlign: 'right', marginTop: 16}}>Total: LKR {parseFloat(sale.total_amount).toFixed(2)}</Title>
        </div>
    </Modal>
  );
};

const PaymentForm = ({ form, total }) => {
    const paymentMethod = Form.useWatch('payment_method', form);
    const [amountTendered, setAmountTendered] = useState(0);
    const change = amountTendered - total;

    return (
        <>
            <Title level={4}>Total: LKR {total.toFixed(2)}</Title>
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

export const PosModal = ({ visible, onClose, onSaleComplete }) => {
  const [books, setBooks] = useState([]);
  const [bookshops, setBookshops] = useState([]);
  const [form] = Form.useForm();
  const [cart, setCart] = useState([]);
  const [bookOptions, setBookOptions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSale, setCompletedSale] = useState(null);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    if (visible) {
        fetchBooks();
        fetchBookshops();
    }
  }, [visible]);

  const fetchBooks = async () => { try { const res = await fetch(`${API_URL}/books`); const data = await res.json(); setBooks(data); setBookOptions(data.map(b => ({ value: b.name, id: b.id, price: b.price, quantity: b.quantity }))); } catch (e) { message.error('Failed to fetch books'); } };
  const fetchBookshops = async () => { try { const res = await fetch(`${API_URL}/bookshops`); setBookshops(await res.json()); } catch (e) { message.error('Failed to fetch bookshops'); } };

  const resetState = () => {
    setCart([]);
    form.resetFields();
    setCurrentStep(0);
    setCompletedSale(null);
  }

  const handleCancel = () => {
      resetState();
      onClose();
  }

  const handleAddToCart = (value, option) => {
    const book = books.find(b => b.id === option.id);
    if (book) {
        const existing = cart.find(item => item.BookId === book.id);
        if (existing) {
            setCart(cart.map(item => item.BookId === book.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { BookId: book.id, name: book.name, price: book.price, quantity: 1, maxQuantity: book.quantity }]);
        }
    }
  };

  const handleQuantityChange = (BookId, quantity) => {
    setCart(cart.map(item => item.BookId === BookId ? { ...item, quantity } : item));
  }

  const handleFinalizeSale = async () => {
    try {
      const values = await form.validateFields();
      if (cart.length === 0) { message.error('Cart is empty!'); return; }
      const saleData = { ...values, items: cart.map(({ BookId, quantity }) => ({ BookId, quantity })) };

      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const newSale = await response.json();
        message.success('Sale created successfully');
        setCompletedSale(newSale);
        onSaleComplete(); // Notify parent to refetch data
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create sale');
      }
    } catch (error) { message.error(error.message); }
  };

  const cartColumns = [
      { title: 'Book', dataIndex: 'name', key: 'name' },
      { title: 'Price', dataIndex: 'price', key: 'price', render: (val) => `LKR ${val}` },
      { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (text, record) => 
          <InputNumber min={1} max={record.maxQuantity} value={text} onChange={(val) => handleQuantityChange(record.BookId, val)} />
      },
      { title: 'Subtotal', key: 'subtotal', render: (_, record) => `LKR ${(record.price * record.quantity).toFixed(2)}`}
  ];

  return (
    <>
        <Modal 
            title="Point of Sale"
            visible={visible && !completedSale}
            onCancel={handleCancel} 
            width={800}
            footer={[
                <Button key="back" onClick={() => setCurrentStep(0)} disabled={currentStep !== 1}>Back</Button>,
                <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
                currentStep === 0 ? 
                <Button key="next" type="primary" onClick={() => setCurrentStep(1)} disabled={cart.length === 0}>Proceed to Payment</Button> :
                <Button key="submit" type="primary" onClick={handleFinalizeSale}>Finalize Sale</Button>
            ]}
        >
            <Steps current={currentStep} style={{marginBottom: 24}}>
                <Step title="Cart" />
                <Step title="Payment" />
            </Steps>
            <Form form={form} layout="vertical">
                {currentStep === 0 && (
                    <>
                        <Form.Item name="BookshopId" label="Bookshop" rules={[{ required: true }]}>
                            <Select placeholder="Select a bookshop">
                                {bookshops.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <h3>Add Books to Cart</h3>
                        <AutoComplete
                            options={bookOptions}
                            style={{ width: '100%', marginBottom: 16 }}
                            onSelect={handleAddToCart}
                            placeholder="Search for a book..."
                            filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                        />
                        <Table columns={cartColumns} dataSource={cart} rowKey="BookId" pagination={false} />
                        <Title level={4} style={{textAlign: 'right', marginTop: 16}}>Total: LKR {total.toFixed(2)}</Title>
                    </>
                )}
                {currentStep === 1 && <PaymentForm form={form} total={total} />}
            </Form>
        </Modal>
        {completedSale && <Receipt sale={completedSale} visible={!!completedSale} onDone={handleCancel} />}
    </>
  );
};
