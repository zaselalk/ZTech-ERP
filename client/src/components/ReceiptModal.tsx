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
    content: () => componentRef.current,
    documentTitle: `Receipt-${sale?.id || "Unknown"}`,
    onAfterPrint: () => message.success("Receipt printed successfully"),
    pageStyle: "@page { size: auto; margin: 20mm; }",
  } as any);

  const handleDownloadPDF = () => {
    if (!sale) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Receipt - Sale #${sale.id}`, 14, 20);

    // Info
    doc.setFontSize(12);
    let yPos = 30;

    if (sale.bookshop) {
      doc.text(`Bookshop: ${sale.bookshop.name}`, 14, yPos);
      yPos += 10;
    }

    doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`, 14, yPos);
    yPos += 10;
    doc.text(`Payment Method: ${sale.payment_method}`, 14, yPos);
    yPos += 10;

    // Table
    const tableColumn = ["Item", "Qty", "Price", "Discount", "Total"];
    const tableRows: any[] = [];

    sale.books.forEach((book) => {
      const saleItem = book.SaleItem;
      const price = saleItem?.price || 0;
      const quantity = saleItem?.quantity || 0;
      const discount = saleItem?.discount
        ? `${saleItem.discount} ${
            saleItem.discountType === "Fixed" ? "LKR" : "%"
          }`
        : "-";
      const total = price * quantity;

      const row = [
        book.name,
        quantity,
        formatCurrency(price),
        discount,
        formatCurrency(total),
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
    });

    // Totals
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || yPos;

    const subtotal = sale.books.reduce(
      (acc: number, book) =>
        acc + (book.SaleItem?.price || 0) * (book.SaleItem?.quantity || 0),
      0
    );

    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 14, finalY + 10);
    doc.text(
      `Cart Discount: ${formatCurrency(sale.discount ?? 0)}`,
      14,
      finalY + 20
    );
    doc.setFontSize(14);
    doc.text(`Total: ${formatCurrency(sale.total_amount)}`, 14, finalY + 30);

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
        <div ref={componentRef} className="p-4">
          <div className="text-center mb-4">
            <Title level={3}>Receipt - Sale #{sale.id}</Title>
          </div>
          {sale.bookshop && (
            <div className="mb-2">
              <Text strong>Bookshop:</Text> <Text>{sale.bookshop.name}</Text>
            </div>
          )}
          <div className="mb-2">
            <Text strong>Date:</Text>{" "}
            <Text>{new Date(sale.createdAt).toLocaleString()}</Text>
          </div>
          <div className="mb-4">
            <Text strong>Payment Method:</Text>{" "}
            <Text>{sale.payment_method}</Text>
          </div>

          <Table
            dataSource={sale.books}
            rowKey="id"
            pagination={false}
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
          />

          <div className="text-right mt-4">
            <Text>Subtotal: {formatCurrency(subtotal || 0)}</Text>
            <br />
            <Text>Cart Discount: {formatCurrency(sale.discount ?? 0)}</Text>
            <br />
            <Title level={4} className="mt-2">
              Total: {formatCurrency(sale.total_amount)}
            </Title>
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
