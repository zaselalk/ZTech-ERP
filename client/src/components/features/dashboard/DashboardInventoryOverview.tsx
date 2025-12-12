import { Card, Col, message, Table, Typography } from "antd";
import { WarningOutlined, AlertOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Book } from "../../../types";
import { bookService } from "../../../services";
const { Text } = Typography;

export const DashboardInventoryOverview = () => {
  interface LowStockItem extends Book {
    quantity: number;
  }
  const lowStockColumns = [
    { title: "Book Name", dataIndex: "name", key: "name" },
    { title: "Author", dataIndex: "author", key: "author" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  ];

  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async (): Promise<void> => {
    try {
      const data = await bookService.getLowStockBooks();
      setLowStockItems(data as LowStockItem[]);
    } catch (error) {
      message.error("Failed to fetch low stock items");
    }
  };

  return (
    <Col xs={24} lg={12}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <AlertOutlined style={{ marginRight: "8px", color: "#667eea" }} />
            <span>Low Stock Alert</span>
          </div>
        }
        className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none"
      >
        {lowStockItems.length > 0 && (
          <>
            <div
              style={{
                padding: "16px",
                background: "#fff3cd",
                borderRadius: "8px",
                border: "1px solid #ffeaa7",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <WarningOutlined
                  style={{ color: "#f39c12", marginRight: "8px" }}
                />
                <Text strong style={{ color: "#f39c12" }}>
                  You have {lowStockItems.length} low stock alerts
                </Text>
              </div>
            </div>

            <Table
              columns={lowStockColumns}
              dataSource={lowStockItems}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </>
        )}

        {lowStockItems.length <= 0 && "All items are in stock."}
      </Card>
    </Col>
  );
};
