import { useState, useEffect } from "react";
import { Table, Button, Space, Typography, message } from "antd";
import { Book, Bookshop } from "../../../types";
import { reportService } from "../../../services";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const { Title } = Typography;

export interface LowStockBook extends Book {
  quantity: number;
  reorder_threshold?: number;
  bookshop?: Bookshop;
}

export const LowStockTable = () => {
  const [lowStockData, setLowStockData] = useState<LowStockBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockReport();
  }, []);

  const fetchLowStockReport = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await reportService.getLowStockReport();
      setLowStockData(data);
    } catch {
      message.error("Failed to fetch low stock report");
    } finally {
      setLoading(false);
    }
  };

  const exportLowStockPDF = () => {
    const doc = new jsPDF();
    doc.text("Low Stock Report", 14, 22);

    const tableData = lowStockData.map((book) => [
      book.name,
      book.bookshop?.name || "N/A",
      book.quantity,
      book.reorder_threshold || 0,
    ]);

    autoTable(doc, {
      head: [["Book Name", "Bookshop", "Quantity", "Reorder Threshold"]],
      body: tableData,
      startY: 30,
    });

    doc.save("low_stock_report.pdf");
  };

  const exportLowStockExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      lowStockData.map((book) => ({
        "Book Name": book.name,
        Bookshop: book.bookshop?.name || "N/A",
        Quantity: book.quantity,
        "Reorder Threshold": book.reorder_threshold || 0,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Low Stock");
    XLSX.writeFile(workbook, "low_stock_report.xlsx");
  };

  const lowStockColumns = [
    { title: "Book Name", dataIndex: "name", key: "name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Reorder Threshold",
      dataIndex: "reorder_threshold",
      key: "reorder_threshold",
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mt-8">
        <Title level={3} className="m-0!">
          Low Stock Report
        </Title>
        <Space>
          <Button onClick={exportLowStockPDF}>Export PDF</Button>
          <Button onClick={exportLowStockExcel}>Export Excel</Button>
        </Space>
      </div>
      <Table
        columns={lowStockColumns}
        dataSource={lowStockData}
        rowKey="id"
        loading={loading}
      />
    </>
  );
};
