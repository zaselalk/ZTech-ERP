import { useState, useEffect } from "react";
import { Table, Button, Space, Tag, message } from "antd";
import { FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import { Product } from "../../../types";
import { reportService } from "../../../services";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface LowStockProduct extends Product {
  quantity: number;
  reorder_threshold?: number;
}

export const LowStockTable = () => {
  const [lowStockData, setLowStockData] = useState<LowStockProduct[]>([]);
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

    const tableData = lowStockData.map((product) => [
      product.name,
      product.supplier || "N/A",
      product.quantity,
      product.reorder_threshold || 0,
    ]);

    autoTable(doc, {
      head: [["Product Name", "Supplier", "Quantity", "Reorder Threshold"]],
      body: tableData,
      startY: 30,
    });

    doc.save("low_stock_report.pdf");
  };

  const exportLowStockExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      lowStockData.map((product) => ({
        "Product Name": product.name,
        Supplier: product.supplier || "N/A",
        Quantity: product.quantity,
        "Reorder Threshold": product.reorder_threshold || 0,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Low Stock");
    XLSX.writeFile(workbook, "low_stock_report.xlsx");
  };

  const getStockStatusColor = (quantity: number, threshold: number = 10) => {
    if (quantity === 0) return "red";
    if (quantity <= threshold / 2) return "orange";
    return "gold";
  };

  const lowStockColumns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: LowStockProduct, b: LowStockProduct) =>
        a.name.localeCompare(b.name),
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      render: (supplier: string) => supplier || "N/A",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a: LowStockProduct, b: LowStockProduct) =>
        a.quantity - b.quantity,
      render: (quantity: number, record: LowStockProduct) => (
        <Tag color={getStockStatusColor(quantity, record.reorder_threshold)}>
          {quantity} units
        </Tag>
      ),
    },
    {
      title: "Reorder Threshold",
      dataIndex: "reorder_threshold",
      key: "reorder_threshold",
      render: (threshold: number) => threshold || 10,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Space>
          <Button icon={<FilePdfOutlined />} onClick={exportLowStockPDF}>
            Export PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportLowStockExcel}>
            Export Excel
          </Button>
        </Space>
      </div>
      <Table
        columns={lowStockColumns}
        dataSource={lowStockData}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: 600 }}
      />
    </div>
  );
};
