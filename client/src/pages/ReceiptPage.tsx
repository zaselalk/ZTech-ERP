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
import {
  PrinterOutlined,
  MailOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { formatCurrency } from "../utils";
import { salesService } from "../services";
import { Sale } from "../types";

const { Content } = Layout;
const { Title, Text } = Typography;

const ReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const componentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        setLoading(true);
        const saleData = await salesService.getSaleById(id!);
        setSale(saleData);
      } catch (e) {
        message.error("Failed to load receipt. " + (e as Error).message);
        navigate("/reports");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id, navigate]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  } as any);

  const handleEmailReceipt = async (email: string): Promise<void> => {
    try {
      await salesService.sendReceiptEmail(id!, email);
      message.success("Receipt sent successfully to " + email);
      setEmailModalVisible(false);
      form.resetFields();
    } catch (e) {
      message.error("Failed to send email. " + (e as Error).message);
    }
  };

  if (loading) {
    return (
      <Layout className="min-h-screen bg-[#f5f6fa]">
        <Content className="p-[50px] text-center">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!sale) {
    return null;
  }

  const subtotal = sale.books.reduce(
    (acc: number, book) =>
      acc + (book.SaleItem?.price || 0) * (book.SaleItem?.quantity || 0),
    0
  );

  return (
    <Layout className="min-h-screen bg-[#f5f6fa]">
      <Content className="p-6 max-w-[900px] mx-auto">
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/reports")}
            className="mb-4"
          >
            Back to Reports
          </Button>
          <div className="flex justify-between items-center">
            <Title level={2}>Receipt</Title>
            <div>
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                className="mr-2"
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
          <div ref={componentRef} className="p-6">
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
                  render: (val: number) => formatCurrency(val),
                },
                {
                  title: "Discount",
                  dataIndex: ["SaleItem"],
                  key: "discount",
                  render: (si: any) =>
                    si?.discount > 0
                      ? `${si.discount} ${
                          si.discount_type === "Fixed" ? "LKR" : "%"
                        }`
                      : "-",
                },
                {
                  title: "Total",
                  key: "total",
                  render: (_: unknown, record: Sale["books"][number]) =>
                    formatCurrency(
                      (record.SaleItem?.price || 0) *
                        (record.SaleItem?.quantity || 0)
                    ),
                },
              ]}
              pagination={false}
            />
            <div className="text-right mt-4">
              <Text>Subtotal: {formatCurrency(subtotal)}</Text>
              <br />
              <Text>Cart Discount: {formatCurrency(sale.discount ?? 0)}</Text>
              <br />
              <Title level={4}>
                Total: {formatCurrency(sale.total_amount)}
              </Title>
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
