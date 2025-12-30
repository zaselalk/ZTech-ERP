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
  InputNumber,
  Form,
} from "antd";
import {
  EyeOutlined,
  UndoOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Dayjs } from "dayjs";
import {
  purchaseReturnService,
  PurchaseReturn,
  PurchaseReturnSummary,
} from "../../../services/purchaseReturnService";
import { formatCurrency } from "../../../utils";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface PurchaseReturnsListProps {
  refreshTrigger?: number;
  supplierId?: number;
}

export const PurchaseReturnsList = ({
  refreshTrigger = 0,
  supplierId,
}: PurchaseReturnsListProps) => {
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<PurchaseReturnSummary | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(
    null
  );
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundForm] = Form.useForm();

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
    supplierId,
  ]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await purchaseReturnService.getPurchaseReturns({
        page: pagination.current,
        limit: pagination.pageSize,
        startDate: startStr,
        endDate: endStr,
        supplierId,
      });
      setReturns(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("Failed to fetch purchase returns");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await purchaseReturnService.getPurchaseReturnSummary({
        startDate: startStr,
        endDate: endStr,
      });
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  const handleViewDetails = async (record: PurchaseReturn) => {
    try {
      const fullReturn = await purchaseReturnService.getPurchaseReturn(
        record.id
      );
      setSelectedReturn(fullReturn);
      setDetailsVisible(true);
    } catch (error) {
      message.error("Failed to load return details");
    }
  };

  const handleAddRefund = (record: PurchaseReturn) => {
    setSelectedReturn(record);
    refundForm.resetFields();
    setRefundModalVisible(true);
  };

  const handleSubmitRefund = async () => {
    try {
      const values = await refundForm.validateFields();
      await purchaseReturnService.updatePurchaseReturn(selectedReturn!.id, {
        refund_received: values.amount,
      });
      message.success("Refund recorded successfully");
      setRefundModalVisible(false);
      fetchReturns();
      fetchSummary();
    } catch (error: any) {
      message.error(error.message || "Failed to record refund");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "green";
      case "Partial":
        return "orange";
      case "Pending":
        return "red";
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
      title: "Purchase #",
      dataIndex: "PurchaseId",
      key: "PurchaseId",
      width: 90,
      render: (purchaseId: number, record: PurchaseReturn) => (
        <div>
          <Text code>#{purchaseId}</Text>
          {record.purchase?.invoiceNumber && (
            <div className="text-xs text-gray-400">
              {record.purchase.invoiceNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Supplier",
      key: "supplier",
      render: (_: any, record: PurchaseReturn) => record.supplier?.name || "-",
    },
    {
      title: "Return Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: number) => (
        <Text type="warning" strong>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: "Refund Status",
      key: "refund_status",
      render: (_: any, record: PurchaseReturn) => {
        const pending =
          Number(record.total_amount) - Number(record.refund_received);
        return (
          <div>
            <Tag color={getStatusColor(record.refund_status)}>
              {record.refund_status}
            </Tag>
            {record.refund_status !== "Completed" && (
              <div className="text-xs text-gray-400 mt-1">
                Pending: {formatCurrency(pending)}
              </div>
            )}
          </div>
        );
      },
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Partial", value: "Partial" },
        { text: "Completed", value: "Completed" },
      ],
      onFilter: (value: React.Key | boolean, record: PurchaseReturn) =>
        record.refund_status === value,
    },
    {
      title: "Refund Received",
      dataIndex: "refund_received",
      key: "refund_received",
      render: (val: number) => (
        <Text type="success">{formatCurrency(val)}</Text>
      ),
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
      sorter: (a: PurchaseReturn, b: PurchaseReturn) =>
        new Date(a.returnDate).getTime() - new Date(b.returnDate).getTime(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: PurchaseReturn) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            View
          </Button>
          {record.refund_status !== "Completed" && (
            <Button
              type="link"
              icon={<DollarOutlined />}
              onClick={() => handleAddRefund(record)}
              size="small"
            >
              Refund
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Returns"
              value={summary?.totalReturns || 0}
              prefix={<UndoOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Return Value"
              value={summary?.totalAmount || 0}
              prefix={<DollarOutlined className="text-orange-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Refund Received"
              value={summary?.totalRefundReceived || 0}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Pending Refund"
              value={summary?.pendingRefund || 0}
              prefix={<ClockCircleOutlined className="text-red-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#cf1322" }}
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
              <Descriptions.Item label="Purchase #">
                #{selectedReturn.PurchaseId}
                {selectedReturn.purchase?.invoiceNumber &&
                  ` (${selectedReturn.purchase.invoiceNumber})`}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {selectedReturn.supplier?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Return Amount">
                <Text type="warning" strong>
                  {formatCurrency(Number(selectedReturn.total_amount))}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Refund Status">
                <Tag color={getStatusColor(selectedReturn.refund_status)}>
                  {selectedReturn.refund_status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Refund Received">
                <Text type="success">
                  {formatCurrency(Number(selectedReturn.refund_received))}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Return Date">
                {new Date(selectedReturn.returnDate).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Reason">
                {selectedReturn.reason || "-"}
              </Descriptions.Item>
              {selectedReturn.notes && (
                <Descriptions.Item label="Notes">
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
                          Qty: {item.quantity} ×{" "}
                          {formatCurrency(item.unit_cost)}
                          {item.updateInventory && (
                            <Tag color="orange" className="ml-2">
                              Stock Reduced
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
                        <Text type="warning" strong>
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

      {/* Record Refund Modal */}
      <Modal
        title="Record Supplier Refund"
        open={refundModalVisible}
        onCancel={() => setRefundModalVisible(false)}
        onOk={handleSubmitRefund}
        okText="Record Refund"
      >
        {selectedReturn && (
          <Form form={refundForm} layout="vertical">
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <Text>
                <strong>Return Total:</strong>{" "}
                {formatCurrency(Number(selectedReturn.total_amount))}
              </Text>
              <br />
              <Text>
                <strong>Already Received:</strong>{" "}
                {formatCurrency(Number(selectedReturn.refund_received))}
              </Text>
              <br />
              <Text type="danger">
                <strong>Pending:</strong>{" "}
                {formatCurrency(
                  Number(selectedReturn.total_amount) -
                    Number(selectedReturn.refund_received)
                )}
              </Text>
            </div>
            <Form.Item
              name="amount"
              label="Refund Amount Received"
              rules={[
                { required: true, message: "Please enter the refund amount" },
                {
                  type: "number",
                  max:
                    Number(selectedReturn.total_amount) -
                    Number(selectedReturn.refund_received),
                  message: "Amount cannot exceed pending refund",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={
                  Number(selectedReturn.total_amount) -
                  Number(selectedReturn.refund_received)
                }
                formatter={(value) =>
                  `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/Rs\.\s?|(,*)/g, "") as any}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};
