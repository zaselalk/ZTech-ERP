import { useState, useEffect } from "react";
import { Table, Button, Space, message, Tag } from "antd";
import {
  FilePdfOutlined,
  FileExcelOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Sale } from "../../../types";
import { formatCurrency } from "../../../utils";
import { reportService } from "../../../services";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface SalesReportTableProps {
  onViewReceipt: (saleId: number) => void;
  startDate?: string;
  endDate?: string;
}

export const SalesReportTable = ({
  onViewReceipt,
  startDate,
  endDate,
}: SalesReportTableProps) => {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesReport();
  }, [startDate, endDate]);

  const fetchSalesReport = async (): Promise<void> => {
    try {
      setLoading(true);
      let data: Sale[];
      if (startDate && endDate) {
        data = await reportService.getSalesReport(
          new Date(startDate).toISOString(),
          new Date(endDate).toISOString()
        );
      } else {
        data = await reportService.getSalesReport();
      }
      setSalesData(data);
    } catch {
      message.error("Failed to fetch sales report");
    } finally {
      setLoading(false);
    }
  };

  const exportSalesPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 22);

    const tableData = salesData.map((sale) => [
      sale.id,
      sale.customer?.name || "N/A",
      formatCurrency(
        typeof sale.total_amount === "number"
          ? sale.total_amount
          : parseFloat(sale.total_amount as string)
      ),
      sale.payment_method || "N/A",
      new Date(sale.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["Sale ID", "Customer", "Total Amount", "Payment Method", "Date"]],
      body: tableData,
      startY: 30,
    });

    doc.save("sales_report.pdf");
  };

  const exportSalesExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      salesData.map((sale) => ({
        "Sale ID": sale.id,
        Customer: sale.customer?.name || "N/A",
        "Total Amount":
          typeof sale.total_amount === "number"
            ? sale.total_amount
            : parseFloat(sale.total_amount as string),
        "Payment Method": sale.payment_method,
        Date: new Date(sale.createdAt).toLocaleString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, "sales_report.xlsx");
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "green";
      case "card":
        return "blue";
      case "credit":
        return "orange";
      default:
        return "default";
    }
  };

  const salesColumns = [
    {
      title: "Sale ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: Sale, b: Sale) => a.id - b.id,
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customer",
      render: (name: string) => name || "Walk-in Customer",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: number | string) =>
        formatCurrency(typeof val === "number" ? val : parseFloat(val)),
      sorter: (a: Sale, b: Sale) => {
        const aVal =
          typeof a.total_amount === "number"
            ? a.total_amount
            : parseFloat(a.total_amount as string);
        const bVal =
          typeof b.total_amount === "number"
            ? b.total_amount
            : parseFloat(b.total_amount as string);
        return aVal - bVal;
      },
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (method: string) => (
        <Tag color={getPaymentMethodColor(method)}>{method || "N/A"}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => new Date(val).toLocaleString(),
      sorter: (a: Sale, b: Sale) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Sale) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => onViewReceipt(record.id)}
        >
          Receipt
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Space>
          <Button icon={<FilePdfOutlined />} onClick={exportSalesPDF}>
            Export PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportSalesExcel}>
            Export Excel
          </Button>
        </Space>
      </div>
      <Table
        columns={salesColumns}
        dataSource={salesData}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} sales`,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};
