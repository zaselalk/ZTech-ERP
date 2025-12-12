import { useState, useEffect } from "react";
import { Table, Button, Space, Typography, message } from "antd";
import { Sale } from "../../../types";
import { formatCurrency } from "../../../utils";
import { reportService } from "../../../services";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const { Title } = Typography;

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
      sale.bookshop?.name || "N/A",
      formatCurrency(
        typeof sale.total_amount === "number"
          ? sale.total_amount
          : parseFloat(sale.total_amount as string)
      ),
      sale.payment_method || "N/A",
      new Date(sale.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["Sale ID", "Bookshop", "Total Amount", "Payment Method", "Date"]],
      body: tableData,
      startY: 30,
    });

    doc.save("sales_report.pdf");
  };

  const exportSalesExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      salesData.map((sale) => ({
        "Sale ID": sale.id,
        Bookshop: sale.bookshop?.name || "N/A",
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

  const salesColumns = [
    { title: "Sale ID", dataIndex: "id", key: "id" },
    { title: "Bookshop", dataIndex: ["bookshop", "name"], key: "bookshop" },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: number | string) =>
        `${formatCurrency(typeof val === "number" ? val : parseFloat(val))}`,
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Sale) => (
        <Button type="link" onClick={() => onViewReceipt(record.id)}>
          View Receipt
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mt-8">
        <Title level={3} className="m-0!">
          Sales Report
        </Title>
        <Space>
          <Button onClick={exportSalesPDF}>Export PDF</Button>
          <Button onClick={exportSalesExcel}>Export Excel</Button>
        </Space>
      </div>
      <Table
        columns={salesColumns}
        dataSource={salesData}
        rowKey="id"
        loading={loading}
      />
    </>
  );
};
