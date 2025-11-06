import { formatCurrency } from "../utils";
import { useState, useEffect, useRef } from "react";
import {
  Layout,
  Input,
  Card,
  Row,
  Col,
  Typography,
  Table,
  Button,
  message,
  Modal,
  Form,
  Select,
  InputNumber,
  Divider,
  Popover,
  List,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import api from "../utils/api";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const API_URL = "http://localhost:5001/api";

// --- Re-usable sub-components ---

const Receipt = ({ sale, onDone, onEmail, visible }) => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({ content: () => componentRef.current });
  if (!sale) return null;

  const subtotal = sale.books.reduce(
    (acc, book) => acc + book.SaleItem.price * book.SaleItem.quantity,
    0
  );

  return (
    <Modal
      title="Sale Successful"
      visible={visible}
      onCancel={onDone}
      footer={[
        <Button key="back" onClick={onDone}>
          New Sale
        </Button>,
        <Button key="submit" type="primary" onClick={handlePrint}>
          Print Receipt
        </Button>,
        <Button key="email" onClick={onEmail}>
          Email Receipt
        </Button>,
      ]}
    >
      <div ref={componentRef} style={{ padding: 20 }}>
        <Title level={4}>Receipt - Sale #{sale.id}</Title>
        {sale.bookshop && (
          <>
            <Text>
              <strong>Bookshop:</strong> {sale.bookshop.name}
            </Text>
            <br />
          </>
        )}
        <Text>
          <strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}
        </Text>
        <br />
        <Text>
          <strong>Payment Method:</strong> {sale.payment_method}
        </Text>
        <Divider />
        <Table
          dataSource={sale.books}
          columns={[
            { title: "Item", dataIndex: "name", key: "name" },
            {
              title: "Qty",
              dataIndex: ["SaleItem", "quantity"],
              key: "quantity",
            },
            {
              title: "Price",
              dataIndex: ["SaleItem", "price"],
              key: "price",
              render: (val) => formatCurrency(val),
            },
            {
              title: "Discount",
              dataIndex: ["SaleItem"],
              key: "discount",
              render: (si) =>
                si.discount > 0
                  ? `${si.discount} ${
                      si.discount_type === "Fixed" ? "LKR" : "%"
                    }`
                  : "-",
            },
            {
              title: "Total",
              key: "total",
              render: (_, record) =>
                formatCurrency(
                  record.SaleItem.price * record.SaleItem.quantity
                ),
            },
          ]}
          pagination={false}
          size="small"
        />
        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Text>Subtotal: {formatCurrency(subtotal)}</Text>
          <br />
          <Text>Cart Discount: {formatCurrency(sale.discount)}</Text>
          <br />
          <Title level={5}>Total: {formatCurrency(sale.total_amount)}</Title>
        </div>
      </div>
    </Modal>
  );
};

const ItemDiscountModal = ({ item, visible, onApply, onCancel }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        discountValue: item.discountValue || 0,
        discountType: item.discountType || "Fixed",
      });
    }
  }, [visible, item, form]);

  const handleApply = () => {
    form.validateFields().then((values) => {
      onApply(item.id, values);
    });
  };

  return (
    <Modal
      title={`Discount for ${item.name}`}
      visible={visible}
      onOk={handleApply}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Discount Value" name="discountValue">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Discount Type" name="discountType">
          <Select>
            <Option value="Fixed">Fixed (LKR)</Option>
            <Option value="Percentage">Percentage (%)</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EmailReceiptModal = ({ visible, onSend, onCancel }) => {
  const [form] = Form.useForm();

  const handleSend = () => {
    form.validateFields().then((values) => {
      onSend(values.email);
    });
  };

  return (
    <Modal
      title="Email Receipt"
      visible={visible}
      onOk={handleSend}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Recipient Email"
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const PosPage = () => {
  // --- State Management ---
  const [topSellers, setTopSellers] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartDiscountInput, setCartDiscountInput] = useState(0);
  const [cartDiscountType, setCartDiscountType] = useState("Fixed");
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState(null);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const searchTimeout = useRef(null);

  // --- Data Fetching ---
  useEffect(() => {
    fetchTopSellers();
  }, []);
  const fetchTopSellers = async () => {
    try {
      const res = await api.fetch(`${API_URL}/books/top-sellers`);
      setTopSellers(await res.json());
    } catch (e) {
      message.error("Failed to load top sellers");
    }
  };

  const handleSearch = async (query) => {
    if (query) {
      try {
        const res = await api.fetch(`${API_URL}/books?search=${query}`);
        setSearchResults(await res.json());
      } catch (e) {
        message.error("Failed to search for books");
      }
    } else {
      setSearchResults(null);
    }
  };

  const debouncedSearch = (query) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSendEmail = async (email) => {
    try {
      const response = await api.fetch(
        `${API_URL}/sales/${completedSale.id}/email`,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );
      if (response.ok) {
        message.success("Receipt sent successfully");
        setIsEmailModalVisible(false);
      } else {
        throw new Error(
          (await response.json()).message || "Failed to send receipt"
        );
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // --- Cart & Discount Logic ---
  const handleAddToCart = (book) => {
    const existing = cart.find((item) => item.id === book.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        { ...book, quantity: 1, discountValue: 0, discountType: "Fixed" },
      ]);
    }
  };

  const handleQuantityChange = (bookId, quantity) => {
    setCart(
      cart
        .map((item) => (item.id === bookId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleItemDiscountApply = (bookId, discount) => {
    setCart(
      cart.map((item) => (item.id === bookId ? { ...item, ...discount } : item))
    );
    setEditingItem(null);
  };

  const calculateItemTotal = (item) => {
    let priceAfterDiscount = parseFloat(item.price);
    if (item.discountType === "Fixed") {
      priceAfterDiscount -= parseFloat(item.discountValue);
    } else if (item.discountType === "Percentage") {
      priceAfterDiscount *= 1 - parseFloat(item.discountValue) / 100;
    }
    return Math.max(0, priceAfterDiscount) * item.quantity;
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const subtotalAfterItemDiscounts = cart.reduce(
    (acc, item) => acc + calculateItemTotal(item),
    0
  );
  const finalCartDiscount =
    cartDiscountType === "Fixed"
      ? cartDiscountInput
      : (subtotalAfterItemDiscounts * cartDiscountInput) / 100;
  const total = Math.max(0, subtotalAfterItemDiscounts - finalCartDiscount);

  const resetSale = () => {
    setCart([]);
    setCartDiscountInput(0);
    setCartDiscountType("Fixed");
    setIsCheckoutVisible(false);
    setCompletedSale(null);
    setEditingItem(null);
  };

  // --- UI Rendering & Columns ---
  const cartColumns = [
    { title: "Book", dataIndex: "name", key: "name" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (val) => formatCurrency(val),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      render: (text, record) => (
        <InputNumber
          size="small"
          min={0}
          value={text}
          onChange={(val) => handleQuantityChange(record.id, val)}
        />
      ),
    },
    {
      title: "Discount",
      key: "discount",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => setEditingItem(record)}
        >
          {record.discountValue > 0
            ? `${record.discountValue}${
                record.discountType === "Fixed" ? "" : "%"
              }`
            : "Add"}
        </Button>
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) => formatCurrency(calculateItemTotal(record)),
    },
  ];

  const cartDiscountSelector = (
    <Select value={cartDiscountType} onChange={setCartDiscountType}>
      <Option value="Fixed">LKR</Option>
      <Option value="Percentage">%</Option>
    </Select>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ color: "white", margin: 0 }}>
          Point of Sale
        </Title>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </Header>
      <Layout style={{ height: "calc(100vh - 64px)" }}>
        <Content
          style={{
            padding: "24px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Search
            placeholder="Search for books..."
            onChange={(e) => debouncedSearch(e.target.value)}
            style={{ marginBottom: 24, flexShrink: 0 }}
          />
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              background: "white",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <List
              dataSource={searchResults !== null ? searchResults : topSellers}
              renderItem={(book) => (
                <List.Item
                  actions={[
                    <Button
                      key="add"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddToCart(book)}
                      size="large"
                    >
                      Add to Cart
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {book.name}
                      </span>
                    }
                    description={
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "14px", color: "#52c41a" }}
                        >
                          {formatCurrency(book.price)}
                        </Text>
                        {book.author && (
                          <div style={{ marginTop: "4px" }}>
                            <Text type="secondary">by {book.author}</Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              pagination={false}
            />
          </div>
        </Content>
        <Sider
          width="50%"
          theme="light"
          style={{ padding: 0, borderLeft: "1px solid #f0f0f0", flex: 1 }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "24px",
            }}
          >
            <Title level={4} style={{ marginBottom: "16px" }}>
              Cart
            </Title>
            <div
              style={{
                maxHeight: "calc(100vh - 350px)",
                overflowY: "auto",
                marginBottom: "16px",
              }}
            >
              <Table
                columns={cartColumns}
                dataSource={cart}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ y: false }}
              />
            </div>
            <div
              style={{
                marginTop: "auto",
                paddingTop: "16px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <Text strong>Subtotal: {formatCurrency(subtotal)}</Text>
                <br />
                <Text type="secondary">
                  Subtotal (after item discounts):{" "}
                  {formatCurrency(subtotalAfterItemDiscounts)}
                </Text>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Text strong style={{ marginRight: 8 }}>
                    Cart Discount:
                  </Text>
                  <InputNumber
                    value={cartDiscountInput}
                    onChange={setCartDiscountInput}
                    min={0}
                    addonAfter={cartDiscountSelector}
                  />
                </div>
                <Title level={4} style={{ marginTop: 8 }}>
                  Total: {formatCurrency(total)}
                </Title>
              </div>
              <Button
                type="primary"
                block
                size="large"
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutVisible(true)}
                style={{ marginTop: 16 }}
              >
                Checkout
              </Button>
            </div>
          </div>
        </Sider>
      </Layout>
      {isCheckoutVisible && (
        <CheckoutModal
          visible={isCheckoutVisible}
          onClose={() => setIsCheckoutVisible(false)}
          cart={cart}
          total={total}
          cartDiscount={{ type: cartDiscountType, value: cartDiscountInput }}
          onSaleComplete={(sale) => {
            setIsCheckoutVisible(false);
            setCompletedSale(sale);
          }}
        />
      )}
      {editingItem && (
        <ItemDiscountModal
          item={editingItem}
          visible={!!editingItem}
          onApply={handleItemDiscountApply}
          onCancel={() => setEditingItem(null)}
        />
      )}
      {completedSale && (
        <Receipt
          sale={completedSale}
          visible={!!completedSale}
          onDone={resetSale}
          onEmail={() => setIsEmailModalVisible(true)}
        />
      )}
      {isEmailModalVisible && (
        <EmailReceiptModal
          visible={isEmailModalVisible}
          onSend={handleSendEmail}
          onCancel={() => setIsEmailModalVisible(false)}
        />
      )}
    </Layout>
  );
};

const CheckoutModal = ({
  visible,
  onClose,
  cart,
  total,
  cartDiscount,
  onSaleComplete,
}) => {
  const [form] = Form.useForm();
  const [bookshops, setBookshops] = useState([]);
  useEffect(() => {
    if (visible) fetchBookshops();
  }, [visible]);
  const fetchBookshops = async () => {
    try {
      const res = await api.fetch(`${API_URL}/bookshops`);
      setBookshops(await res.json());
    } catch (e) {
      message.error("Failed to fetch bookshops");
    }
  };

  const handleFinalizeSale = async () => {
    try {
      const values = await form.validateFields();
      const saleData = {
        ...values,
        items: cart.map((item) => ({
          BookId: item.id,
          quantity: item.quantity,
          discount: item.discountValue,
          discount_type: item.discountType,
        })),
        cartDiscount,
      };
      const response = await api.fetch(`${API_URL}/sales`, {
        method: "POST",
        body: JSON.stringify(saleData),
      });
      if (response.ok) {
        onSaleComplete(await response.json());
      } else {
        throw new Error(
          (await response.json()).message || "Failed to create sale"
        );
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Modal
      title="Finalize Sale"
      visible={visible}
      onOk={handleFinalizeSale}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <PaymentForm form={form} total={total} bookshops={bookshops} />
      </Form>
    </Modal>
  );
};

const PaymentForm = ({ form, total, bookshops }) => {
  const paymentMethod = Form.useWatch("payment_method", form);
  const [amountTendered, setAmountTendered] = useState(0);
  const change = amountTendered - total;

  return (
    <>
      <Title level={4}>Total Due: {formatCurrency(total)}</Title>
      <Form.Item
        name="BookshopId"
        label="Bookshop"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select a bookshop">
          {bookshops.map((shop) => (
            <Option key={shop.id} value={shop.id}>
              {shop.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="payment_method"
        label="Payment Method"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select a payment method">
          <Option value="Cash">Cash</Option>
          <Option value="Card">Card</Option>
          <Option value="Consignment">Consignment</Option>
        </Select>
      </Form.Item>
      {paymentMethod === "Cash" && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Amount Tendered">
              <InputNumber
                min={total}
                style={{ width: "100%" }}
                value={amountTendered}
                onChange={setAmountTendered}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Title level={5} style={{ paddingTop: 30 }}>
              Change: {formatCurrency(change > 0 ? change : 0)}
            </Title>
          </Col>
        </Row>
      )}
    </>
  );
};

export default PosPage;
