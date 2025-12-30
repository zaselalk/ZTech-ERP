import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Table,
  InputNumber,
  Checkbox,
  Button,
  message,
  Space,
  Typography,
  Alert,
  Divider,
} from "antd";
import { UndoOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { salesService, saleReturnService } from "../../../services";
import { SaleItemResponse } from "../../../types";
import { formatCurrency } from "../../../utils";

const { Text } = Typography;
const { TextArea } = Input;

interface SaleReturnModalProps {
  visible: boolean;
  saleId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReturnItem {
  saleItemId: number;
  productName: string;
  originalQuantity: number;
  returnQuantity: number;
  price: number;
  restockInventory: boolean;
  reason?: string;
}

export const SaleReturnModal = ({
  visible,
  saleId,
  onClose,
  onSuccess,
}: SaleReturnModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [existingReturns, setExistingReturns] = useState<any[]>([]);

  useEffect(() => {
    if (visible && saleId) {
      fetchSaleDetails();
      fetchExistingReturns();
    } else {
      resetForm();
    }
  }, [visible, saleId]);

  const fetchSaleDetails = async () => {
    if (!saleId) return;
    try {
      setLoading(true);
      const saleData = await salesService.getSaleById(saleId);

      // Initialize return items from sale items
      const items: ReturnItem[] = (saleData.items || []).map(
        (item: SaleItemResponse) => ({
          saleItemId: item.id,
          productName: item.productName || `Product #${item.ProductId}`,
          originalQuantity: item.quantity,
          returnQuantity: 0,
          price: parseFloat(item.price),
          restockInventory: true,
          reason: "",
        })
      );
      setReturnItems(items);
    } catch (error) {
      message.error("Failed to load sale details");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingReturns = async () => {
    if (!saleId) return;
    try {
      const returns = await saleReturnService.getReturnsBySale(saleId);
      setExistingReturns(returns);
    } catch (error) {
      console.error("Failed to fetch existing returns", error);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setReturnItems([]);
    setExistingReturns([]);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...returnItems];
    newItems[index].returnQuantity = quantity;
    setReturnItems(newItems);
  };

  const handleRestockChange = (index: number, restock: boolean) => {
    const newItems = [...returnItems];
    newItems[index].restockInventory = restock;
    setReturnItems(newItems);
  };

  const handleReasonChange = (index: number, reason: string) => {
    const newItems = [...returnItems];
    newItems[index].reason = reason;
    setReturnItems(newItems);
  };

  const calculateTotalRefund = () => {
    return returnItems.reduce(
      (sum, item) => sum + item.returnQuantity * item.price,
      0
    );
  };

  const getMaxReturnQuantity = (item: ReturnItem) => {
    // Check how many have already been returned for this item
    let alreadyReturned = 0;
    existingReturns.forEach((ret) => {
      ret.items?.forEach((ri: any) => {
        if (ri.SaleItemId === item.saleItemId) {
          alreadyReturned += ri.quantity;
        }
      });
    });
    return item.originalQuantity - alreadyReturned;
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      const itemsToReturn = returnItems.filter(
        (item) => item.returnQuantity > 0
      );

      if (itemsToReturn.length === 0) {
        message.warning("Please select at least one item to return");
        return;
      }

      // Validate quantities
      for (const item of itemsToReturn) {
        const maxQty = getMaxReturnQuantity(item);
        if (item.returnQuantity > maxQty) {
          message.error(
            `Cannot return more than ${maxQty} units of ${item.productName}`
          );
          return;
        }
      }

      setLoading(true);

      const formValues = form.getFieldsValue();

      await saleReturnService.createSaleReturn({
        saleId: saleId!,
        items: itemsToReturn.map((item) => ({
          saleItemId: item.saleItemId,
          quantity: item.returnQuantity,
          reason: item.reason,
          restockInventory: item.restockInventory,
        })),
        refund_method: formValues.refund_method,
        reason: formValues.reason,
        notes: formValues.notes,
      });

      message.success("Return processed successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || "Failed to process return");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      width: "30%",
    },
    {
      title: "Sold Qty",
      dataIndex: "originalQuantity",
      key: "originalQuantity",
      width: "10%",
      align: "center" as const,
    },
    {
      title: "Max Return",
      key: "maxReturn",
      width: "10%",
      align: "center" as const,
      render: (_: any, record: ReturnItem) => {
        const max = getMaxReturnQuantity(record);
        return <Text type={max === 0 ? "secondary" : undefined}>{max}</Text>;
      },
    },
    {
      title: "Return Qty",
      key: "returnQuantity",
      width: "15%",
      render: (_: any, record: ReturnItem, index: number) => {
        const max = getMaxReturnQuantity(record);
        return (
          <InputNumber
            min={0}
            max={max}
            value={record.returnQuantity}
            onChange={(val) => handleQuantityChange(index, val || 0)}
            disabled={max === 0}
            size="small"
            style={{ width: "100%" }}
          />
        );
      },
    },
    {
      title: "Refund",
      key: "refund",
      width: "15%",
      render: (_: any, record: ReturnItem) =>
        formatCurrency(record.returnQuantity * record.price),
    },
    {
      title: "Restock",
      key: "restockInventory",
      width: "10%",
      align: "center" as const,
      render: (_: any, record: ReturnItem, index: number) => (
        <Checkbox
          checked={record.restockInventory}
          onChange={(e) => handleRestockChange(index, e.target.checked)}
          disabled={record.returnQuantity === 0}
        />
      ),
    },
    {
      title: "Item Reason",
      key: "reason",
      width: "20%",
      render: (_: any, record: ReturnItem, index: number) => (
        <Input
          size="small"
          placeholder="Optional"
          value={record.reason}
          onChange={(e) => handleReasonChange(index, e.target.value)}
          disabled={record.returnQuantity === 0}
        />
      ),
    },
  ];

  const totalRefund = calculateTotalRefund();

  return (
    <Modal
      title={
        <Space>
          <UndoOutlined />
          <span>Process Sale Return - Sale #{saleId}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          onClick={handleSubmit}
          loading={loading}
          disabled={totalRefund === 0}
        >
          Process Return ({formatCurrency(totalRefund)})
        </Button>,
      ]}
    >
      {existingReturns.length > 0 && (
        <Alert
          type="info"
          icon={<ExclamationCircleOutlined />}
          message={`This sale has ${
            existingReturns.length
          } previous return(s) totaling ${formatCurrency(
            existingReturns.reduce(
              (sum, r) => sum + parseFloat(r.total_amount),
              0
            )
          )}`}
          className="mb-4"
          showIcon
        />
      )}

      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Form.Item
            name="refund_method"
            label="Refund Method"
            initialValue="Cash"
            rules={[{ required: true, message: "Please select refund method" }]}
          >
            <Select>
              <Select.Option value="Cash">Cash Refund</Select.Option>
              <Select.Option value="Card">Card Refund</Select.Option>
              <Select.Option value="Credit">
                Store Credit (Add to customer balance)
              </Select.Option>
              <Select.Option value="Exchange">Exchange</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="Return Reason">
            <Input placeholder="e.g., Defective product, Wrong item" />
          </Form.Item>
        </div>

        <Divider>Items to Return</Divider>

        <Table
          dataSource={returnItems}
          columns={columns}
          rowKey="saleItemId"
          pagination={false}
          size="small"
          loading={loading}
          scroll={{ y: 300 }}
        />

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <Text strong>Total Refund Amount:</Text>
            <Text strong className="text-xl text-red-600">
              {formatCurrency(totalRefund)}
            </Text>
          </div>
        </div>

        <Form.Item name="notes" label="Additional Notes" className="mt-4">
          <TextArea
            rows={2}
            placeholder="Any additional notes for this return"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
