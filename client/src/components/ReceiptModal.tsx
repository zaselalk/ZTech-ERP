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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "../utils";
import { salesService } from "../services";
import { Sale } from "../types";

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
    onAfterPrint: () => message.success("Receipt printed successfully"),
  });

  const handleDownloadPDF = () => {
    if (!sale) return;

    const doc = new jsPDF();

    // Load and add logo
    const img = new Image();
    img.src = "/logo/storyflix-logo.png";

    // Add logo (20x20 size at position 14, 15)
    doc.addImage(img, "PNG", 14, 15, 40, 25);

    // Company Header (right side of logo)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185); // Blue color
    doc.text("Storyflix Pvt Ltd", 105, 25, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("267B, Pahala Yagoda, Ganemulla", 105, 32, { align: "center" });
    doc.text(
      "Tel: 0773549230 / 0762208912 | Email: storyflix2022@gmail.com",
      105,
      37,
      { align: "center" }
    );

    // Separator line
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.8);
    doc.line(14, 45, 196, 45);

    // Receipt Title with background
    doc.setFillColor(41, 128, 185);
    doc.rect(70, 50, 70, 10, "F");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("SALES RECEIPT", 105, 57, { align: "center" });

    // Info section with better layout
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let yPos = 68;

    // Left column
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice No:`, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${String(sale.id).padStart(3, "0")}`, 45, yPos);

    // Right column
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice Date:`, 140, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date(sale.createdAt).toLocaleDateString()}`, 170, yPos);
    yPos += 7;

    if (sale.bookshop) {
      doc.setFont("helvetica", "bold");
      doc.text(`Customer:`, 14, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${sale.bookshop.name}`, 45, yPos);
      yPos += 7;
    }

    doc.setFont("helvetica", "bold");
    doc.text(`Payment:`, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${sale.payment_method}`, 45, yPos);
    yPos += 12;

    // Table
    const tableColumn = ["Item", "Qty", "Price", "Discount", "Total"];
    const tableRows: any[] = [];

    sale.books.forEach((book) => {
      if (!book.SaleItem) return;
      const saleItem = book.SaleItem;
      let last_price = saleItem?.price || 0;
      const quantity_price = saleItem.price || 0;
      const quantity = saleItem?.quantity || 0;
      const discount = saleItem?.discount
        ? `${saleItem.discount} ${
            saleItem.discount_type === "Fixed" ? "LKR" : "%"
          }`
        : "-";

      //  calculate price after discount when fixed
      if (saleItem.discount > 0 && saleItem.discount_type == "Fixed") {
        last_price = last_price - saleItem.discount;
      }

      //  calculate price after discount when percentage
      if (saleItem.discount > 0 && saleItem.discount_type == "Percentage") {
        last_price = last_price - (last_price * saleItem.discount) / 100;
        console.log(last_price);
      }

      const total = last_price * quantity;

      const row = [
        book.name,
        quantity,
        formatCurrency(quantity_price),
        discount,
        formatCurrency(total),
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "center" },
        4: { halign: "right" },
      },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { left: 14, right: 14 },
    });

    // Totals
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || yPos;

    const subtotal = sale.books.reduce(
      (acc: number, book) =>
        acc + (book.SaleItem?.price || 0) * (book.SaleItem?.quantity || 0),
      0
    );

    // Totals section with box
    const totalsStartY = finalY + 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal:`, 140, totalsStartY);
    doc.text(formatCurrency(subtotal), 195, totalsStartY, { align: "right" });

    doc.text(`Discount:`, 140, totalsStartY + 7);
    doc.setTextColor(220, 53, 69); // Red for discount
    doc.text(`-${formatCurrency(sale.discount ?? 0)}`, 195, totalsStartY + 7, {
      align: "right",
    });

    // Total with background
    doc.setFillColor(41, 128, 185);
    doc.rect(135, totalsStartY + 12, 61, 10, "F");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`Total:`, 140, totalsStartY + 19);
    doc.text(formatCurrency(sale.total_amount), 195, totalsStartY + 19, {
      align: "right",
    });

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your business!", 105, totalsStartY + 35, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Please keep this receipt for your records.",
      105,
      totalsStartY + 41,
      {
        align: "center",
      }
    );

    // Promotional footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, totalsStartY + 48, 196, totalsStartY + 48);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Need a Tailored Software Solution? We’re Just a Call Away: 077 124 2254 (Asela)",
      105,
      totalsStartY + 54,
      {
        align: "center",
      }
    );

    doc.save(`receipt-${sale.id}.pdf`);
    message.success("PDF downloaded successfully");
  };

  const handleEmailReceipt = async (email: string) => {
    if (!saleId) return;
    try {
      await salesService.sendReceiptEmail(saleId, email);
      message.success("Receipt sent successfully to " + email);
      setEmailModalVisible(false);
      form.resetFields();
    } catch (e) {
      message.error("Failed to send email. " + (e as Error).message);
    }
  };

  const subtotal = sale?.books.reduce(
    (acc: number, book) =>
      acc + (book.SaleItem?.price || 0) * (book.SaleItem?.quantity || 0),
    0
  );

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
            <div className="flex justify-between items-center w-full">
              <img
                src="/logo/storyflix-logo.png"
                alt="Storyflix Logo"
                className=" h-16 mr-4"
              />
              <div>
                <Title level={2} className="mb-1! text-blue-600">
                  Storyflix Pvt Ltd
                </Title>
                <Text className="block text-gray-600 text-sm">
                  267B, Pahala Yagoda, Ganemulla
                </Text>
                <Text className="block text-gray-600 text-sm">
                  Tel: 0773549230 / 0762208912
                </Text>
                <Text className="block text-gray-600 text-sm">
                  Email: storyflix2022@gmail.com
                </Text>
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
            {sale.bookshop && (
              <div>
                <Text strong className="text-gray-700">
                  Customer:
                </Text>{" "}
                <Text>{sale.bookshop.name}</Text>
              </div>
            )}
            <div className={sale.bookshop ? "text-right" : ""}>
              <Text strong>Payment:</Text> <Text>{sale.payment_method}</Text>
            </div>
          </div>

          <Table
            dataSource={sale.books}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            className="mb-6"
            columns={[
              {
                title: "DESCRIPTION",
                dataIndex: "name",
                key: "name",
                width: "35%",
              },
              {
                title: "QTY",
                dataIndex: ["SaleItem", "quantity"],
                key: "quantity",
                align: "center",
                width: "10%",
              },
              {
                title: "RATE",
                dataIndex: ["SaleItem", "price"],
                key: "price",
                align: "right",
                width: "18%",
                render: (val: number) => formatCurrency(val),
              },
              {
                title: "DISC",
                dataIndex: ["SaleItem"],
                key: "discount",
                align: "center",
                width: "15%",
                render: (si: any) =>
                  si?.discount > 0
                    ? `${si.discount} ${
                        si.discount_type === "Fixed" ? "LKR" : "%"
                      }`
                    : "-",
              },
              {
                title: "AMOUNT",
                key: "total",
                align: "right",
                width: "22%",
                render: (_: unknown, record: Sale["books"][number]) => {
                  const discountType = record.SaleItem?.discount_type;
                  const discountValue = record.SaleItem?.discount || 0;
                  let price = record.SaleItem?.price || 0;
                  const quantity = record.SaleItem?.quantity || 0;

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
            <p className="block text-gray-300 text-xs">
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
