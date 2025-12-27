import { Modal, Table, Tag, Space, Button, Input, message } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { Quotation } from "../../../types";
import { formatCurrency } from "../../../utils";
import { buildReceiptHtml } from "../../../utils/ReceiptBuilder";
import { quotationService } from "../../../services";
import { settingsService, Settings } from "../../../services/settingsService";

interface QuotationListModalProps {
  visible: boolean;
  onClose: () => void;
  onConvert: (quotation: Quotation) => void;
}

const QuotationListModal = ({
  visible,
  onClose,
  onConvert,
}: QuotationListModalProps) => {
  const [searchText, setSearchText] = useState("");
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | undefined>(undefined);

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
    if (visible) {
      fetchQuotations();
    }
  }, [visible]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getQuotations("active");
      setQuotations(data);
    } catch (error) {
      message.error("Failed to fetch quotations");
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter((quotation) => {
    const searchLower = searchText.toLowerCase();
    return (
      quotation.id?.toString().includes(searchLower) ||
      quotation.customer?.name?.toLowerCase().includes(searchLower) ||
      quotation.total_amount?.toString().includes(searchLower) ||
      new Date(quotation.createdAt)
        .toLocaleDateString()
        .toLowerCase()
        .includes(searchLower)
    );
  });
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Expires",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (date: string) => {
        const expires = new Date(date);
        const isExpired = expires < new Date();
        return (
          <Tag color={isExpired ? "red" : "green"}>
            {expires.toLocaleDateString()}
          </Tag>
        );
      },
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customer",
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Quotation) => (
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={async () => {
              const doc = await buildReceiptHtml(record, settings);
              doc.save(`quotation-${record.id}.pdf`);
            }}
          >
            PDF
          </Button>
          <Button type="primary" onClick={() => onConvert(record)}>
            Convert
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="Active Quotations"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
        <Input
          placeholder="Search by ID, customer, date, or amount..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </Space>
      <Table
        dataSource={filteredQuotations}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={loading}
      />
    </Modal>
  );
};

export default QuotationListModal;
