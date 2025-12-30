import { useState, useEffect } from "react";
import { Modal, Button, message, Form, Input, Spin } from "antd";
import {
  PrinterOutlined,
  MailOutlined,
  FilePdfOutlined,
  WhatsAppOutlined,
  EyeOutlined,
  CheckOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { formatCurrency, formatNumber } from "../../../utils";
import { salesService } from "../../../services";
import { Sale } from "../../../types";
import { buildReceiptHtml } from "../../../utils/ReceiptBuilder";
import { settingsService, Settings } from "../../../services/settingsService";

interface SaleCompleteModalProps {
  saleId: number | null;
  visible: boolean;
  onClose: () => void;
  onViewReceipt: () => void;
}

const SaleCompleteModal = ({
  saleId,
  visible,
  onClose,
  onViewReceipt,
}: SaleCompleteModalProps) => {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [whatsappModalVisible, setWhatsappModalVisible] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [form] = Form.useForm();
  const [whatsappForm] = Form.useForm();
  const [settings, setSettings] = useState<Settings | undefined>(undefined);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    loadSettings();
  }, []);

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
      message.error("Failed to load sale details.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt-${sale?.id || "Unknown"}`,
  });

  const handleDownloadPDF = async () => {
    if (!sale) return;

    try {
      const doc = await buildReceiptHtml(sale, settings);
      doc.save(`receipt-${sale.id}.pdf`);
      message.success("PDF downloaded successfully");
    } catch (e) {
      message.error("Failed to generate PDF");
    }
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

  const handleWhatsAppShare = (phoneNumber: string) => {
    if (!sale) return;

    // Format the receipt message
    const businessName = settings?.businessName || "Our Store";
    const receiptText = `
🧾 *Receipt from ${businessName}*
━━━━━━━━━━━━━━━━━
📋 Invoice #: ${String(sale.id).padStart(3, "0")}
📅 Date: ${new Date(sale.createdAt).toLocaleDateString()}
${sale.customer ? `👤 Customer: ${sale.customer.name}` : ""}
💳 Payment: ${sale.payment_method}
━━━━━━━━━━━━━━━━━

*Items:*
${sale.items
  ?.map(
    (item) =>
      `• ${item.productName || "Unknown"} x${item.quantity} - ${formatCurrency(
        parseFloat(item.price) * item.quantity
      )}`
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━
*Total: ${formatCurrency(sale.total_amount)}*

Thank you for your purchase! 🙏
    `.trim();

    // Format phone number (remove spaces, dashes, and ensure it starts with country code)
    let formattedPhone = phoneNumber.replace(/[\s-()]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "94" + formattedPhone.substring(1); // Sri Lanka country code
    } else if (
      !formattedPhone.startsWith("+") &&
      !formattedPhone.startsWith("94")
    ) {
      formattedPhone = "94" + formattedPhone;
    }
    formattedPhone = formattedPhone.replace("+", "");

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
      receiptText
    )}`;
    window.open(whatsappUrl, "_blank");
    setWhatsappModalVisible(false);
    whatsappForm.resetFields();
  };

  // Hidden print component for useReactToPrint
  const HiddenReceiptContent = () => {
    if (!sale) return null;

    const subtotal =
      sale.items?.reduce((acc, item) => {
        let itemPrice = parseFloat(item.price) || 0;
        const qty = item.quantity || 0;
        if (parseFloat(item.discount) > 0) {
          if (item.discount_type === "Fixed") {
            itemPrice -= parseFloat(item.discount);
          } else if (item.discount_type === "Percentage") {
            itemPrice -= (itemPrice * parseFloat(item.discount)) / 100;
          }
        }
        return acc + itemPrice * qty;
      }, 0) || 0;

    return (
      <div ref={printRef} className="hidden print:block p-8 bg-white">
        {/* Company Header with Logo */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-blue-500">
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center w-full flex-wrap gap-4">
            <img
              src={settings?.logoUrl || "/logo/storyflix-logo.png"}
              alt="Business Logo"
              className="h-16 mr-4"
            />
            <div>
              <div className="text-center md:text-right">
                <h2 className="mb-1 text-blue-600 text-2xl font-bold">
                  {settings?.businessName || "Storyflix Pvt Ltd"}
                </h2>
                <p className="block text-gray-600 text-sm">
                  {settings?.address ||
                    "No.09, Sunhill Gardens, Yatadola, Matugama."}
                </p>
                <p className="block text-gray-600 text-sm">
                  {settings?.phone
                    ? `Tel: ${settings.phone}`
                    : "Tel: +94706995585(WhatsApp) / +94712114841"}
                </p>
                <p className="block text-gray-600 text-sm">
                  {settings?.email
                    ? `Email: ${settings.email}`
                    : "Email: digital@storyflix.lk"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-6">
          <div className="inline-block bg-blue-600 text-white px-8 py-2 rounded">
            <h3 className="mb-0 text-white text-xl font-bold">SALES RECEIPT</h3>
          </div>
        </div>

        {/* Receipt Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
          <div>
            <strong className="text-gray-700">Invoice No:</strong>{" "}
            {String(sale.id).padStart(3, "0")}
          </div>
          <div className="text-right">
            <strong className="text-gray-700">Invoice Date:</strong>{" "}
            {new Date(sale.createdAt).toLocaleDateString()}
          </div>
          {sale.customer && (
            <div>
              <strong className="text-gray-700">Customer:</strong>{" "}
              {sale.customer.name}
            </div>
          )}
          <div>
            <strong>Payment:</strong> {sale.payment_method}
          </div>
        </div>

        {/* Items Table */}
        <table
          style={{
            width: "100%",
            marginBottom: "24px",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  textAlign: "left",
                  width: "40%",
                }}
              >
                Item
              </th>
              <th
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  textAlign: "center",
                  width: "10%",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  textAlign: "right",
                  width: "25%",
                }}
              >
                Rate (Rs.)
              </th>
              <th
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  textAlign: "right",
                  width: "25%",
                }}
              >
                Amount (Rs.)
              </th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map((item, index) => {
              let price = parseFloat(item.price) || 0;
              const discountValue = parseFloat(item.discount) || 0;
              if (discountValue > 0) {
                if (item.discount_type === "Fixed") {
                  price -= discountValue;
                } else if (item.discount_type === "Percentage") {
                  price -= (price * discountValue) / 100;
                }
              }
              return (
                <tr key={index}>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {item.productName || "Unknown Product"}
                    {discountValue > 0 && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#ef4444",
                          display: "block",
                        }}
                      >
                        Disc: {item.discount}
                        {item.discount_type === "Percentage" ? "%" : ""}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {formatNumber(parseFloat(item.price))}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {formatNumber(price * item.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-end mb-2">
            <div className="w-72">
              <div className="flex justify-between mb-2 py-2">
                <span className="text-gray-700">Subtotal:</span>
                <strong className="text-base">
                  {formatCurrency(subtotal)}
                </strong>
              </div>
              <div className="flex justify-between mb-2 py-2">
                <span className="text-gray-700">Discount:</span>
                <strong className="text-red-600 text-base">
                  -{formatCurrency(sale.discount ?? 0)}
                </strong>
              </div>
              <div className="flex justify-between bg-blue-600 text-white px-4 py-3 rounded mt-2">
                <strong className="text-lg">Total:</strong>
                <strong className="text-lg">
                  {formatCurrency(sale.total_amount)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t border-gray-200">
          <p className="text-gray-600 italic font-medium">
            {settings?.receiptFooter || "Thank you for your business!"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Please keep this receipt for your records.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={420}
        centered
        closable={false}
        className="sale-complete-modal"
        styles={{
          body: {
            padding: 0,
          },
          mask: {
            backdropFilter: "blur(4px)",
          },
        }}
        transitionName="ant-slide-up"
      >
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Success Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 px-6 pt-10 pb-8 text-center">
              {/* Decorative circles */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-20 -right-10 w-60 h-60 bg-white/5 rounded-full"></div>

              {/* Success Icon */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white mx-auto mb-5 flex items-center justify-center shadow-xl shadow-emerald-600/30 animate-bounce-once">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <CheckOutlined className="text-4xl text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white m-0 mb-1 drop-shadow-sm">
                Sale Complete!
              </h2>
              <p className="text-emerald-100 text-sm m-0 mb-5">
                Invoice #{sale ? String(sale.id).padStart(3, "0") : "---"}
              </p>

              {/* Amount Card */}
              <div className="relative bg-white rounded-2xl px-6 py-4 mx-4 shadow-xl">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider m-0 mb-1">
                  Total Amount
                </p>
                <p className="text-3xl font-bold text-slate-800 m-0 tracking-tight">
                  {sale ? formatCurrency(sale.total_amount) : "---"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-5 bg-slate-50/50">
              <p className="text-slate-400 text-xs font-medium text-center mb-4 uppercase tracking-wide">
                Share Receipt
              </p>

              <div className="grid grid-cols-4 gap-2 mb-5">
                {/* Print Button */}
                <button
                  onClick={() => handlePrint()}
                  disabled={!sale}
                  className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-200">
                    <PrinterOutlined className="text-xl text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600">
                    Print
                  </span>
                </button>

                {/* PDF Button */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={!sale}
                  className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center mb-2 group-hover:bg-red-200 group-hover:scale-110 transition-all duration-200">
                    <FilePdfOutlined className="text-xl text-red-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-red-600">
                    PDF
                  </span>
                </button>

                {/* Email Button */}
                <button
                  onClick={() => setEmailModalVisible(true)}
                  disabled={!sale}
                  className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center mb-2 group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-200">
                    <MailOutlined className="text-xl text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-purple-600">
                    Email
                  </span>
                </button>

                {/* WhatsApp Button */}
                <button
                  onClick={() => {
                    if (sale?.customer?.phone) {
                      whatsappForm.setFieldsValue({
                        phone: sale.customer.phone,
                      });
                    }
                    setWhatsappModalVisible(true);
                  }}
                  disabled={!sale}
                  className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-2 group-hover:bg-green-200 group-hover:scale-110 transition-all duration-200">
                    <WhatsAppOutlined className="text-xl text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-green-600">
                    WhatsApp
                  </span>
                </button>
              </div>

              {/* View Receipt Link */}
              <button
                onClick={onViewReceipt}
                disabled={!sale}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <EyeOutlined className="text-base" />
                <span className="text-sm font-medium">View Full Receipt</span>
              </button>
            </div>

            {/* Done Button */}
            <div className="px-5 pb-5 bg-slate-50/50">
              <Button
                type="primary"
                size="large"
                onClick={onClose}
                block
                className="h-14 rounded-2xl font-semibold text-base bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 border-0 shadow-lg shadow-indigo-500/25"
              >
                <span>New Sale</span>
                <ArrowRightOutlined className="ml-2" />
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Email Modal */}
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
        zIndex={1100}
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

      {/* WhatsApp Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <WhatsAppOutlined className="text-green-500" />
            <span>Share via WhatsApp</span>
          </div>
        }
        open={whatsappModalVisible}
        onOk={() => {
          whatsappForm.validateFields().then((values) => {
            handleWhatsAppShare(values.phone);
          });
        }}
        okText="Share"
        okButtonProps={{ className: "bg-green-500 hover:bg-green-600" }}
        onCancel={() => {
          setWhatsappModalVisible(false);
          whatsappForm.resetFields();
        }}
        zIndex={1100}
      >
        <Form form={whatsappForm} layout="vertical">
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: "Please enter a phone number" },
              {
                pattern: /^[+]?[\d\s-()]+$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <Input placeholder="077 123 4567 or +94771234567" />
          </Form.Item>
          <p className="text-slate-500 text-xs">
            This will open WhatsApp with a pre-filled message containing the
            receipt details.
          </p>
        </Form>
      </Modal>

      {/* Hidden print content */}
      <div style={{ display: "none" }}>
        <HiddenReceiptContent />
      </div>
    </>
  );
};

export default SaleCompleteModal;
