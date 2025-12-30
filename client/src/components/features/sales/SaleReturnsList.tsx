import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  DatePicker,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Modal,
  Descriptions,
  List,
} from "antd";
import {
  EyeOutlined,
  UndoOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Dayjs } from "dayjs";
import {
  saleReturnService,
  SaleReturn,
  SaleReturnSummary,
} from "../../../services/saleReturnService";
import { formatCurrency } from "../../../utils";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface SaleReturnsListProps {
  refreshTrigger?: number;
  customerId?: number;
}

export const SaleReturnsList = ({
  refreshTrigger = 0,
  customerId,
}: SaleReturnsListProps) => {
  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SaleReturnSummary | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [selectedReturn, setSelectedReturn] = useState<SaleReturn | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const startStr = dateRange?.[0]?.format("YYYY-MM-DD");
  const endStr = dateRange?.[1]?.format("YYYY-MM-DD");

  useEffect(() => {
    fetchReturns();
    fetchSummary();
  }, [
    pagination.current,
    pagination.pageSize,
    startStr,
    endStr,
    refreshTrigger,
    customerId,
  ]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await saleReturnService.getSaleReturns({
        page: pagination.current,
        limit: pagination.pageSize,
        startDate: startStr,
        endDate: endStr,
        customerId,
      });
      setReturns(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("Failed to fetch sale returns");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await saleReturnService.getSaleReturnSummary({
        startDate: startStr,
        endDate: endStr,
        customerId,
      });
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  const handleViewDetails = async (record: SaleReturn) => {
    try {
      const fullReturn = await saleReturnService.getSaleReturn(record.id);
      setSelectedReturn(fullReturn);
      setDetailsVisible(true);
    } catch (error) {
      message.error("Failed to load return details");
    }
  };

  const getRefundMethodColor = (method: string) => {
    switch (method) {
      case "Cash":
        return "green";
      case "Card":
        return "blue";
      case "Credit":
        return "orange";
      case "Exchange":
        return "purple";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Sale #",
      dataIndex: "SaleId",
      key: "SaleId",
      width: 80,
      render: (saleId: number) => <Text code>#{saleId}</Text>,
    },
    {
      title: "Customer",
      key: "customer",
      render: (_: any, record: SaleReturn) =>
        record.customer?.name || "Walk-in Customer",
    },
    {
      title: "Refund Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: number) => (
        <Text type="danger" strong>
          {formatCurrency(val)}
        </Text>
      ),
      sorter: (a: SaleReturn, b: SaleReturn) =>
        Number(a.total_amount) - Number(b.total_amount),
    },
    {
      title: "Refund Method",
      dataIndex: "refund_method",
      key: "refund_method",
      render: (method: string) => (
        <Tag color={getRefundMethodColor(method)}>{method}</Tag>
      ),
      filters: [
        { text: "Cash", value: "Cash" },
        { text: "Card", value: "Card" },
        { text: "Credit", value: "Credit" },
        { text: "Exchange", value: "Exchange" },
      ],
      onFilter: (value: React.Key | boolean, record: SaleReturn) =>
        record.refund_method === value,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (reason: string) => reason || "-",
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (val: string) => {
        const date = new Date(val);
        return (
          <span>
            {date.toLocaleDateString()}
            <span className="text-gray-400 ml-2 text-xs">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </span>
        );
      },
      sorter: (a: SaleReturn, b: SaleReturn) =>
        new Date(a.returnDate).getTime() - new Date(b.returnDate).getTime(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: any, record: SaleReturn) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Total Returns"
              value={summary?.totalReturns || 0}
              prefix={<UndoOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Total Refunded"
              value={summary?.totalRefunded || 0}
              prefix={<DollarOutlined className="text-red-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Items Returned"
              value={
                summary?.byRefundMethod?.reduce(
                  (sum, m) => sum + Number(m.count),
                  0
                ) || 0
              }
              prefix={<ShoppingCartOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small">
        <Space wrap>
          <Text strong>Filter by Date:</Text>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            allowClear
          />
        </Space>
      </Card>

      {/* Table */}
      <Table
        dataSource={returns}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} returns`,
          onChange: (page, pageSize) =>
            setPagination({ ...pagination, current: page, pageSize }),
        }}
        size="small"
      />

      {/* Details Modal */}
      <Modal
        title={
          <Space>
            <UndoOutlined />
            <span>Return Details - #{selectedReturn?.id}</span>
          </Space>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedReturn && (
          <div className="space-y-4">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Sale #">
                #{selectedReturn.SaleId}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedReturn.customer?.name || "Walk-in Customer"}
              </Descriptions.Item>
              <Descriptions.Item label="Refund Amount">
                <Text type="danger" strong>
                  {formatCurrency(Number(selectedReturn.total_amount))}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Refund Method">
                <Tag color={getRefundMethodColor(selectedReturn.refund_method)}>
                  {selectedReturn.refund_method}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Return Date">
                {new Date(selectedReturn.returnDate).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Reason">
                {selectedReturn.reason || "-"}
              </Descriptions.Item>
              {selectedReturn.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {selectedReturn.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Card title="Returned Items" size="small">
              <List
                dataSource={selectedReturn.items || []}
                renderItem={(item: any) => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <div>
                        <Text strong>
                          {item.productName || item.product?.name}
                        </Text>
                        <br />
                        <Text type="secondary">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                          {item.restockInventory && (
                            <Tag color="green" className="ml-2">
                              Restocked
                            </Tag>
                          )}
                        </Text>
                        {item.reason && (
                          <div>
                            <Text type="secondary" italic>
                              Reason: {item.reason}
                            </Text>
                          </div>
                        )}
                      </div>
                      <div>
                        <Text type="danger" strong>
                          {formatCurrency(item.refund_amount)}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};
