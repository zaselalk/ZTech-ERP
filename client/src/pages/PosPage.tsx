import { formatCurrency } from "../utils";
import { useState, useEffect, useRef } from "react";
import {
  Layout,
  Input,
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
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { bookService, bookshopService, salesService } from "../services";
import { Book, Sale, Bookshop } from "../types";
import type { FormInstance } from "antd/es/form";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// --- Re-usable sub-components ---

interface ReceiptProps {
  sale: Sale | null;
  onDone: () => void;
  onEmail: () => void;
  visible: boolean;
}
const Receipt = ({ sale, onDone, onEmail, visible }: ReceiptProps) => {
  const componentRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  } as any);
  if (!sale) return null;

  const subtotal = sale.books.reduce(
    (acc, book) =>
      acc + (book.SaleItem?.price || 0) * (book.SaleItem?.quantity || 0),
    0
  );

  return (
    <Modal
      title="Sale Successful"
      // visible={visible}
      open={visible}
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
      <div ref={componentRef} className="p-5">
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
                  (record.SaleItem?.price || 0) *
                    (record.SaleItem?.quantity || 0)
                ),
            },
          ]}
          pagination={false}
          size="small"
        />
        <div className="text-right mt-4">
          <Text>Subtotal: {formatCurrency(subtotal)}</Text>
          <br />
          <Text>Cart Discount: {formatCurrency(sale.discount ?? 0)}</Text>
          <br />
          <Title level={5}>Total: {formatCurrency(sale.total_amount)}</Title>
        </div>
      </div>
    </Modal>
  );
};

interface ItemDiscountModalProps {
  item: CartItem;
  visible: boolean;
  onApply: (
    id: number,
    values: { discountValue: number; discountType: "Fixed" | "Percentage" }
  ) => void;
  onCancel: () => void;
}
const ItemDiscountModal = ({
  item,
  visible,
  onApply,
  onCancel,
}: ItemDiscountModalProps) => {
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
      open={visible}
      onOk={handleApply}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Discount Value" name="discountValue">
          <InputNumber min={0} className="w-full" />
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

interface EmailReceiptModalProps {
  visible: boolean;
  onSend: (email: string) => void;
  onCancel: () => void;
}
const EmailReceiptModal = ({
  visible,
  onSend,
  onCancel,
}: EmailReceiptModalProps) => {
  const [form] = Form.useForm();

  const handleSend = () => {
    form.validateFields().then((values) => {
      onSend(values.email);
    });
  };

  return (
    <Modal
      title="Email Receipt"
      open={visible}
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

interface CartItem extends Book {
  quantity: number;
  availableStock: number;
  discountValue: number;
  discountType: "Fixed" | "Percentage";
}
const PosPage = () => {
  // --- State Management ---
  const [topSellers, setTopSellers] = useState<Book[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscountInput, setCartDiscountInput] = useState<number>(0);
  const [cartDiscountType, setCartDiscountType] = useState<
    "Fixed" | "Percentage"
  >("Fixed");
  const [isCheckoutVisible, setIsCheckoutVisible] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const [isEmailModalVisible, setIsEmailModalVisible] =
    useState<boolean>(false);
  const searchTimeout = useRef<number | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    fetchTopSellers();
  }, []);
  const fetchTopSellers = async (): Promise<void> => {
    try {
      const data = await bookService.getTopSellers();
      setTopSellers(data);
    } catch (e) {
      message.error("Failed to load top sellers");
    }
  };

  const handleSearch = async (query: string): Promise<void> => {
    if (query) {
      try {
        const data = await bookService.searchBooks(query);
        setSearchResults(data);
      } catch (e) {
        message.error("Failed to search for books");
      }
    } else {
      setSearchResults(null);
    }
  };

  const debouncedSearch = (query: string): void => {
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = window.setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSendEmail = async (email: string): Promise<void> => {
    try {
      if (!completedSale) {
        throw new Error("No completed sale to email");
      }
      await salesService.sendReceiptEmail(completedSale.id, email);
      message.success("Receipt sent successfully");
      setIsEmailModalVisible(false);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  // --- Cart & Discount Logic ---
  const handleAddToCart = (book: Book): void => {
    const availableQuantity = book.quantity ?? 0;
    if (availableQuantity <= 0) {
      message.warning(`${book.name} is out of stock`);
      return;
    }

    const existing = cart.find((item) => item.id === book.id);
    if (existing) {
      if (existing.quantity >= existing.availableStock) {
        message.warning(
          `Only ${existing.availableStock} available for ${book.name}`
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...book,
          quantity: 1,
          availableStock: availableQuantity,
          discountValue: 0,
          discountType: "Fixed",
        },
      ]);
    }
  };

  const handleQuantityChange = (bookId: number, quantity: number): void => {
    const cartItem = cart.find((item) => item.id === bookId);
    let finalQuantity = quantity;
    if (cartItem && quantity > cartItem.availableStock) {
      message.warning(
        `Only ${cartItem.availableStock} available for ${cartItem.name}`
      );
      finalQuantity = cartItem.availableStock;
    }
    setCart(
      cart
        .map((item) =>
          item.id === bookId ? { ...item, quantity: finalQuantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleItemDiscountApply = (
    bookId: number,
    discount: { discountValue: number; discountType: "Fixed" | "Percentage" }
  ): void => {
    setCart(
      cart.map((item) => (item.id === bookId ? { ...item, ...discount } : item))
    );
    setEditingItem(null);
  };

  const calculateItemTotal = (item: CartItem): number => {
    let priceAfterDiscount = item.price;
    if (item.discountType === "Fixed") {
      priceAfterDiscount -= item.discountValue;
    } else if (item.discountType === "Percentage") {
      priceAfterDiscount *= 1 - item.discountValue / 100;
    }
    return Math.max(0, priceAfterDiscount) * item.quantity;
  };

  const subtotal = cart.reduce(
    (acc: number, item) => acc + item.price * item.quantity,
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

  const resetSale = (): void => {
    setCart([]);
    setCartDiscountInput(0);
    setCartDiscountType("Fixed");
    setIsCheckoutVisible(false);
    setCompletedSale(null);
    setEditingItem(null);
  };

  const handleClearCart = (): void => {
    setCart([]);
    setCartDiscountInput(0);
    setCartDiscountType("Fixed");
  };

  // --- UI Rendering & Columns ---
  const cartColumns = [
    { title: "Book", dataIndex: "name", key: "name" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (val: number | string) => formatCurrency(val),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      render: (text: number, record: CartItem) => (
        <InputNumber
          size="small"
          min={0}
          max={record.availableStock}
          value={text}
          onChange={(val) => handleQuantityChange(record.id, Number(val))}
        />
      ),
    },
    {
      title: "Discount",
      key: "discount",
      render: (_: unknown, record: CartItem) => (
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
      render: (_: unknown, record: CartItem) =>
        formatCurrency(calculateItemTotal(record)),
    },
  ];

  const cartDiscountSelector = (
    <Select
      value={cartDiscountType}
      onChange={(val: "Fixed" | "Percentage") => setCartDiscountType(val)}
    >
      <Option value="Fixed">LKR</Option>
      <Option value="Percentage">%</Option>
    </Select>
  );

  return (
    <Layout className="min-h-screen">
      <Header className="flex justify-between items-center">
        <Title level={3} style={{ color: "white", margin: 0 }}>
          Point of Sale
        </Title>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </Header>
      <Layout className="h-[calc(100vh-64px)]">
        <Content className="p-6 flex-1 flex flex-col">
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
            {/* <List
              dataSource={searchResults !== null ? searchResults : topSellers}
              renderItem={(book) => {
                const availableQuantity = book.quantity ?? 0;
                const isOutOfStock = availableQuantity <= 0;
                const cartItem = cart.find((item) => item.id === book.id);
                const cartQuantity = cartItem ? cartItem.quantity : 0;
                const canAddToCart = !isOutOfStock && cartQuantity < availableQuantity;

                return (
                  <List.Item
                    actions={[
                      isOutOfStock ? (
                        <Button
                          key="out-of-stock"
                          disabled
                          size="large"
                        >
                          Out of Stock
                        </Button>
                      ) : (
                        <Button
                          key="add"
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => handleAddToCart(book)}
                          size="large"
                          disabled={!canAddToCart}
                        >
                          {canAddToCart ? "Add to Cart" : "Max in Cart"}
                        </Button>
                      ),
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <span className="text-base font-bold">{book.name}</span>
                      }
                      description={
                        <div>
                          <Text strong className="text-sm text-[#52c41a]">
                            {formatCurrency(book.price)}
                          </Text>
                          <div className="mt-1">
                            <Text
                              type={isOutOfStock ? "danger" : "secondary"}
                              strong={isOutOfStock}
                            >
                              {isOutOfStock
                                ? "Out of Stock"
                                : `Available: ${availableQuantity}`}
                            </Text>
                          </div>
                          {book.author && (
                            <div className="mt-1">
                              <Text type="secondary">by {book.author}</Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
              pagination={false}
            /> */}

            <Table
              rowKey="id"
              pagination={false}
              dataSource={searchResults !== null ? searchResults : topSellers}
              columns={[
                {
                  title: "Book",
                  dataIndex: "name",
                  key: "name",
                  render: (name: string, book) => (
                    <div>
                      <span className="text-base font-bold">{name}</span>
                      <div>
                        <Typography.Text
                          strong
                          className="text-sm text-[#52c41a]"
                        >
                          {formatCurrency(book.price)}
                        </Typography.Text>
                        {book.author && (
                          <div className="mt-1">
                            <Typography.Text type="secondary">
                              by {book.author}
                            </Typography.Text>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "Action",
                  key: "action",
                  width: 200,
                  render: (_: unknown, book) => {
                    const availableQuantity = book.quantity ?? 0;
                    const isOutOfStock = availableQuantity <= 0;
                    const cartItem = cart.find((item) => item.id === book.id);
                    const cartQuantity = cartItem ? cartItem.quantity : 0;
                    const canAddToCart =
                      !isOutOfStock && cartQuantity < availableQuantity;

                    return isOutOfStock ? (
                      <Button key="out-of-stock" disabled size="large">
                        Out of Stock
                      </Button>
                    ) : (
                      <Button
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddToCart(book)}
                        size="large"
                        disabled={!canAddToCart}
                      >
                        {canAddToCart ? "Add to Cart" : "Max in Cart"}
                      </Button>
                    );
                  },
                },
              ]}
              size="small"
            />
          </div>
        </Content>
        <Sider
          width="50%"
          theme="light"
          className="p-0 border-l border-[#f0f0f0] flex-1"
        >
          <div className="h-full flex flex-col p-6">
            <Title level={4} className="mb-4">
              Cart
            </Title>
            <div className="max-h-[calc(100vh-350px)] overflow-y-auto mb-4">
              <Table
                columns={cartColumns}
                dataSource={cart}
                rowKey="id"
                pagination={false}
                size="small"
                /* removed invalid scroll prop */
              />
            </div>
            <div className="mt-auto pt-4 border-t border-[#f0f0f0]">
              <div className="text-right">
                <Text strong>Subtotal: {formatCurrency(subtotal)}</Text>
                <br />
                <Text type="secondary">
                  Subtotal (after item discounts):{" "}
                  {formatCurrency(subtotalAfterItemDiscounts)}
                </Text>
                <div className="flex justify-end items-center mt-2">
                  <Text strong className="mr-2">
                    Cart Discount:
                  </Text>
                  <Space.Compact>
                    <InputNumber
                      value={cartDiscountInput}
                      onChange={(val) => setCartDiscountInput(val ?? 0)}
                      min={0}
                    />
                    {cartDiscountSelector}
                  </Space.Compact>
                </div>
                <Title level={4} className="mt-2">
                  Total: {formatCurrency(total)}
                </Title>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  danger
                  size="large"
                  disabled={cart.length === 0}
                  onClick={handleClearCart}
                  className="flex-1"
                >
                  Clear Cart
                </Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutVisible(true)}
                  className="flex-3"
                >
                  Checkout
                </Button>
              </div>
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

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  cartDiscount: { type: "Fixed" | "Percentage"; value: number };
  onSaleComplete: (sale: Sale) => void;
}

const CheckoutModal = ({
  visible,
  onClose,
  cart,
  total,
  cartDiscount,
  onSaleComplete,
}: CheckoutModalProps) => {
  const [form] = Form.useForm();
  const [bookshops, setBookshops] = useState<Bookshop[]>([]);

  useEffect(() => {
    if (visible) fetchBookshops();
  }, [visible]);

  const fetchBookshops = async (): Promise<void> => {
    try {
      const data = await bookshopService.getBookshops();
      setBookshops(data);
    } catch (e) {
      message.error("Failed to fetch bookshops");
    }
  };

  const handleFinalizeSale = async (): Promise<void> => {
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
      const createdSale = await salesService.createSale(saleData);
      onSaleComplete(createdSale);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <Modal
      title="Finalize Sale"
      // visible={visible}
      open={visible}
      onOk={handleFinalizeSale}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <PaymentForm form={form} total={total} bookshops={bookshops} />
      </Form>
    </Modal>
  );
};

interface PaymentFormProps {
  form: FormInstance;
  total: number;
  bookshops: Bookshop[];
}
const PaymentForm = ({ form, total, bookshops }: PaymentFormProps) => {
  const paymentMethod = Form.useWatch("payment_method", form);
  const bookshopId = Form.useWatch("BookshopId", form);
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const change = amountTendered - total;

  const selectedBookshop = bookshops.find((b) => b.id === bookshopId);

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

      {paymentMethod === "Consignment" && selectedBookshop && (
        <div
          style={{
            marginBottom: 16,
            padding: 10,
            background: "#f5f5f5",
            borderRadius: 4,
          }}
        >
          <Text>
            Current Consignment Balance:{" "}
            <strong>{formatCurrency(selectedBookshop.consignment || 0)}</strong>
          </Text>
          <br />
          <Text type="secondary">
            This sale will increase the balance by {formatCurrency(total)}
          </Text>
        </div>
      )}

      {paymentMethod === "Cash" && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Amount Tendered">
              <InputNumber
                min={total}
                className="w-full"
                value={amountTendered}
                onChange={(val) => setAmountTendered(val ?? 0)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Title level={5} className="pt-[30px]">
              Change: {formatCurrency(change > 0 ? change : 0)}
            </Title>
          </Col>
        </Row>
      )}
    </>
  );
};

export default PosPage;
