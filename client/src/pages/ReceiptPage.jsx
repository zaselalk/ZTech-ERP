import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  Divider,
  Spin,
  Card,
} from "antd";
import { PrinterOutlined, MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { formatCurrency } from "../utils";
import api from "../utils/api";

const { Content } = Layout;
const { Title, Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const ReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const componentRef = useRef();

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        setLoading(true);
        const response = await api.fetch(`${API_URL}/sales/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch sale details");
        }
        const saleData = await response.json();
        setSale(saleData);
      } catch (e) {
        message.error("Failed to load receipt. " + e.message);
        navigate("/reports");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id, navigate]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleEmailReceipt = async (email) => {
    try {
      const response = await api.fetch(`${API_URL}/sales/${id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      message.success("Receipt sent successfully to " + email);
      setEmailModalVisible(false);
      form.resetFields();
    } catch (e) {
      message.error("Failed to send email. " + e.message);
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
        <Content style={{ padding: "50px", textAlign: "center" }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!sale) {
    return null;
  }

  const subtotal = sale.books.reduce(
    (acc, book) => acc + book.SaleItem.price * book.SaleItem.quantity,
    0
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <Content style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/reports")}
            style={{ marginBottom: "16px" }}
          >
            Back to Reports
          </Button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2}>Receipt</Title>
            <div>
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                style={{ marginRight: "8px" }}
              >
                Print
              </Button>
              <Button
                icon={<MailOutlined />}
                onClick={() => setEmailModalVisible(true)}
              >
                Email
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <div ref={componentRef} style={{ padding: "24px" }}>
            <Title level={3}>Receipt - Sale #{sale.id}</Title>
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
              rowKey="id"
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
            />
            <div style={{ textAlign: "right", marginTop: "16px" }}>
              <Text>Subtotal: {formatCurrency(subtotal)}</Text>
              <br />
              <Text>Cart Discount: {formatCurrency(sale.discount)}</Text>
              <br />
              <Title level={4}>Total: {formatCurrency(sale.total_amount)}</Title>
            </div>
          </div>
        </Card>

        <Modal
          title="Email Receipt"
          open={emailModalVisible}
          onOk={() => {
            form.validateFields().then((values) => {
              handleEmailReceipt(values.email);
            });
          }}
          onCancel={() => {
            setEmailModalVisible(false);
            form.resetFields();
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Recipient Email"
              name="email"
              rules={[
                { required: true, message: "Please enter an email address" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="customer@example.com" />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ReceiptPage;
