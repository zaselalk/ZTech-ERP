import { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Typography,
  Table,
  Spin,
  message,
  Form,
  Input,
} from "antd";
import {
  PrinterOutlined,
  MailOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { formatCurrency } from "../utils";
import { salesService } from "../services";
import { Sale, SaleItemResponse } from "../types";
import { buildReceiptHtml } from "../utils/ReceiptBuilder";

const { Title, Text } = Typography;

interface ReceiptModalProps {
  saleId: number | null;
  visible: boolean;
  onClose: () => void;
}

const ReceiptModal = ({ saleId, visible, onClose }: ReceiptModalProps) => {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [form] = Form.useForm();
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && saleId) {
      fetchSaleDetails(saleId);
    } else {
      setSale(null);
    }
  }, [visible, saleId]);

  const fetchSaleDetails = async (id: number) => {
    try {
      setLoading(true);
      const saleData = await salesService.getSaleById(id);
      setSale(saleData);
    } catch (e) {
      message.error("Failed to load receipt details.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Receipt-${sale?.id || "Unknown"}`,
    // onAfterPrint: () => message.success("Receipt printed successfully"),
  });

  const handleDownloadPDF = async () => {
    if (!sale) return;

    const doc = await buildReceiptHtml(sale);
    doc.save(`receipt-${sale.id}.pdf`);
    message.success("PDF downloaded successfully");
  };

  const handleEmailReceipt = async (email: string) => {
    if (!saleId) return;
    try {
      setIsEmailSending(true);
      await salesService.sendReceiptEmail(saleId, email);
      message.success("Receipt sent successfully to " + email);
      setEmailModalVisible(false);
      form.resetFields();
    } catch (e) {
      message.error("Failed to send email. " + (e as Error).message);
    } finally {
      setIsEmailSending(false);
    }
  };

  const subtotal = sale?.items?.reduce(
    (acc: number, item: SaleItemResponse) => {
      let itemPrice = parseFloat(item.price) || 0;
      const qty = item.quantity || 0;

      // Apply item level discount logic again to get accurate subtotal
      if (parseFloat(item.discount) > 0) {
        if (item.discount_type === "Fixed") {
          itemPrice -= parseFloat(item.discount);
        } else if (item.discount_type === "Percentage") {
          itemPrice -= (itemPrice * parseFloat(item.discount)) / 100;
        }
      }
      return acc + itemPrice * qty;
    },
    0
  );

  // console.log("Rerender");

  return (
    <Modal
      title="Receipt"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="email"
          icon={<MailOutlined />}
          onClick={() => setEmailModalVisible(true)}
        >
          Email
        </Button>,
        <Button
          key="pdf"
          icon={<DownloadOutlined />}
          onClick={handleDownloadPDF}
          disabled={!sale || loading}
        >
          PDF
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => handlePrint()}
          disabled={!sale || loading}
        >
          Print
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
    >
      {loading ? (
        <div className="text-center p-8">
          <Spin size="large" />
        </div>
      ) : sale ? (
        <div ref={componentRef} className="p-8 bg-white">
          {/* Company Header with Logo */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-blue-500">
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center w-full flex-wrap gap-4">
              <img
                src="/logo/storyflix-logo.png"
                alt="Storyflix Logo"
                className=" h-16 mr-4"
              />
              <div>
                <div className="text-center md:text-right">
                  <Title level={2} className="mb-1! text-blue-600">
                    Storyflix Pvt Ltd
                  </Title>
                  <Text className="block text-gray-600 text-sm">
                    No.09, Sunhill Gardens, Yatadola, Matugama.
                  </Text>
                  <Text className="block text-gray-600 text-sm">
                    Tel: +94706995585(WhatsApp) / +94712114841
                  </Text>
                  <Text className="block text-gray-600 text-sm">
                    Email: digital@storyflix.lk
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Title */}
          <div className="text-center mb-6">
            <div className="inline-block bg-blue-600 text-white px-8 py-2 rounded">
              <Title level={3} className="mb-0! text-white!">
                SALES RECEIPT
              </Title>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <div>
              <Text strong className="text-gray-700">
                Invoice No:
              </Text>{" "}
              <Text>{String(sale.id).padStart(3, "0")}</Text>
            </div>
            <div className="text-right">
              <Text strong className="text-gray-700">
                Invoice Date:
              </Text>{" "}
              <Text>{new Date(sale.createdAt).toLocaleDateString()}</Text>
            </div>
            {sale.customer && (
              <div>
                <Text strong className="text-gray-700">
                  Customer:
                </Text>{" "}
                <Text>{sale.customer.name}</Text>
              </div>
            )}
            <div>
              <Text strong>Payment:</Text> <Text>{sale.payment_method}</Text>
            </div>
          </div>

          <Table
            dataSource={sale.items}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            className="mb-6"
            columns={[
              {
                title: "DESCRIPTION",
                dataIndex: "productName",
                key: "name",
                width: "35%",
                render: (text: string) => text || "Unknown Product",
              },
              {
                title: "QTY",
                dataIndex: "quantity",
                key: "quantity",
                align: "center",
                width: "10%",
              },
              {
                title: "RATE",
                dataIndex: "price",
                key: "price",
                align: "right",
                width: "18%",
                render: (val: string) => formatCurrency(parseFloat(val)),
              },
              {
                title: "DISC",
                key: "discount",
                align: "center",
                width: "15%",
                render: (_: unknown, record: SaleItemResponse) =>
                  parseFloat(record.discount) > 0
                    ? ` ${record.discount_type === "Fixed" ? "Rs." : ""} ${
                        record.discount
                      } ${record.discount_type === "Percentage" ? "%" : ""}`
                    : "-",
              },
              {
                title: "AMOUNT",
                key: "total",
                align: "right",
                width: "22%",
                render: (_: unknown, record: SaleItemResponse) => {
                  const discountType = record.discount_type;
                  const discountValue = parseFloat(record.discount) || 0;
                  let price = parseFloat(record.price) || 0;
                  const quantity = record.quantity || 0;

                  if (discountValue > 0) {
                    if (discountType === "Fixed") {
                      price = price - discountValue;
                    } else if (discountType === "Percentage") {
                      price = price - (price * discountValue) / 100;
                    }
                  }
                  return formatCurrency(price * quantity);
                },
              },
            ]}
          />

          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-end mb-2">
              <div className="w-72">
                <div className="flex justify-between mb-2 py-2">
                  <Text className="text-gray-700">Subtotal:</Text>
                  <Text strong className="text-base">
                    {formatCurrency(subtotal || 0)}
                  </Text>
                </div>
                <div className="flex justify-between mb-2 py-2">
                  <Text className="text-gray-700">Discount:</Text>
                  <Text strong className="text-red-600 text-base">
                    -{formatCurrency(sale.discount ?? 0)}
                  </Text>
                </div>
                <div className="flex justify-between bg-blue-600 text-white px-4 py-3 rounded mt-2">
                  <Text strong className="text-white! text-lg">
                    Total:
                  </Text>
                  <Text strong className="text-white! text-lg">
                    {formatCurrency(sale.total_amount)}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 pt-4 border-t border-gray-200">
            <Text className="block text-gray-600 italic font-medium">
              Thank you for your business!
            </Text>
            <Text className="block text-gray-400 text-sm mt-1">
              Please keep this receipt for your records.
            </Text>
          </div>

          <div className="text-center mt-4 pt-3 border-t border-gray-200">
            <p className="block text-gray-700 text-xs">
              Need a Tailored Software Solution? We’re Just a Call Away:{" "}
              <strong>077 124 2254 (Asela)</strong>
            </p>
          </div>
        </div>
      ) : (
        <div>No data available</div>
      )}

      <Modal
        title="Email Receipt"
        open={emailModalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            handleEmailReceipt(values.email);
          });
        }}
        confirmLoading={isEmailSending}
        okText="Send"
        onCancel={() => {
          setEmailModalVisible(false);
          form.resetFields();
        }}
        zIndex={1001} // Ensure it's above the receipt modal
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
    </Modal>
  );
};

export default ReceiptModal;
