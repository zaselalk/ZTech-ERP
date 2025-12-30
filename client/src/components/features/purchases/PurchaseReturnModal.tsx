import { useState, useEffect } from "react";
import {
  Modal,
  Form,
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
import {
  purchaseService,
  Purchase,
  PurchaseItem,
} from "../../../services/purchaseService";
import { purchaseReturnService } from "../../../services/purchaseReturnService";
import { formatCurrency } from "../../../utils";

const { Text } = Typography;
const { TextArea } = Input;

interface PurchaseReturnModalProps {
  visible: boolean;
  purchaseId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReturnItem {
  purchaseItemId: number;
  productName: string;
  originalQuantity: number;
  returnQuantity: number;
  unitCost: number;
  updateInventory: boolean;
  reason?: string;
}

export const PurchaseReturnModal = ({
  visible,
  purchaseId,
  onClose,
  onSuccess,
}: PurchaseReturnModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [existingReturns, setExistingReturns] = useState<any[]>([]);

  useEffect(() => {
    if (visible && purchaseId) {
      fetchPurchaseDetails();
      fetchExistingReturns();
    } else {
      resetForm();
    }
  }, [visible, purchaseId]);

  const fetchPurchaseDetails = async () => {
    if (!purchaseId) return;
    try {
      setLoading(true);
      const purchaseData = await purchaseService.getPurchaseById(purchaseId);
      setPurchase(purchaseData);

      // Initialize return items from purchase items
      const items: ReturnItem[] = (purchaseData.items || []).map(
        (item: PurchaseItem) => ({
          purchaseItemId: item.id!,
          productName:
            item.productName ||
            item.product?.name ||
            `Product #${item.ProductId}`,
          originalQuantity: item.quantity,
          returnQuantity: 0,
          unitCost: item.unit_cost,
          updateInventory: true,
          reason: "",
        })
      );
      setReturnItems(items);
    } catch (error) {
      message.error("Failed to load purchase details");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingReturns = async () => {
    if (!purchaseId) return;
    try {
      const returns = await purchaseReturnService.getReturnsByPurchase(
        purchaseId
      );
      setExistingReturns(returns);
    } catch (error) {
      console.error("Failed to fetch existing returns", error);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setPurchase(null);
    setReturnItems([]);
    setExistingReturns([]);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...returnItems];
    newItems[index].returnQuantity = quantity;
    setReturnItems(newItems);
  };

  const handleInventoryChange = (index: number, update: boolean) => {
    const newItems = [...returnItems];
    newItems[index].updateInventory = update;
    setReturnItems(newItems);
  };

  const handleReasonChange = (index: number, reason: string) => {
    const newItems = [...returnItems];
    newItems[index].reason = reason;
    setReturnItems(newItems);
  };

  const calculateTotalReturn = () => {
    return returnItems.reduce(
      (sum, item) => sum + item.returnQuantity * item.unitCost,
      0
    );
  };

  const getMaxReturnQuantity = (item: ReturnItem) => {
    // Check how many have already been returned for this item
    let alreadyReturned = 0;
    existingReturns.forEach((ret) => {
      ret.items?.forEach((ri: any) => {
        if (ri.PurchaseItemId === item.purchaseItemId) {
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

      await purchaseReturnService.createPurchaseReturn({
        purchaseId: purchaseId!,
        items: itemsToReturn.map((item) => ({
          purchaseItemId: item.purchaseItemId,
          quantity: item.returnQuantity,
          reason: item.reason,
          updateInventory: item.updateInventory,
        })),
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
      width: "25%",
    },
    {
      title: "Purchased",
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
      width: "12%",
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
      title: "Refund Expected",
      key: "refund",
      width: "13%",
      render: (_: any, record: ReturnItem) =>
        formatCurrency(record.returnQuantity * record.unitCost),
    },
    {
      title: "Remove Stock",
      key: "updateInventory",
      width: "10%",
      align: "center" as const,
      render: (_: any, record: ReturnItem, index: number) => (
        <Checkbox
          checked={record.updateInventory}
          onChange={(e) => handleInventoryChange(index, e.target.checked)}
          disabled={record.returnQuantity === 0}
        />
      ),
    },
    {
      title: "Reason",
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

  const totalReturn = calculateTotalReturn();
  const totalExistingReturns = existingReturns.reduce(
    (sum, r) => sum + parseFloat(r.total_amount),
    0
  );

  return (
    <Modal
      title={
        <Space>
          <UndoOutlined />
          <span>
            Return to Supplier - Purchase #{purchaseId}
            {purchase?.invoiceNumber && ` (Invoice: ${purchase.invoiceNumber})`}
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={950}
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
          disabled={totalReturn === 0}
        >
          Process Return ({formatCurrency(totalReturn)})
        </Button>,
      ]}
    >
      {existingReturns.length > 0 && (
        <Alert
          type="info"
          icon={<ExclamationCircleOutlined />}
          message={`This purchase has ${
            existingReturns.length
          } previous return(s) totaling ${formatCurrency(
            totalExistingReturns
          )}`}
          className="mb-4"
          showIcon
        />
      )}

      {purchase && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <Space size="large">
            <Text>
              <strong>Supplier:</strong> {purchase.supplier?.name}
            </Text>
            <Text>
              <strong>Purchase Total:</strong>{" "}
              {formatCurrency(Number(purchase.total_amount))}
            </Text>
            <Text>
              <strong>Date:</strong>{" "}
              {new Date(purchase.purchaseDate).toLocaleDateString()}
            </Text>
          </Space>
        </div>
      )}

      <Form form={form} layout="vertical">
        <Form.Item name="reason" label="Return Reason">
          <Input placeholder="e.g., Defective products, Wrong items received" />
        </Form.Item>

        <Divider>Items to Return</Divider>

        <Table
          dataSource={returnItems}
          columns={columns}
          rowKey="purchaseItemId"
          pagination={false}
          size="small"
          loading={loading}
          scroll={{ y: 300 }}
        />

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <Text strong>Expected Refund from Supplier:</Text>
            <Text strong className="text-xl text-orange-600">
              {formatCurrency(totalReturn)}
            </Text>
          </div>
          <Text type="secondary" className="text-xs">
            Note: Track supplier refund in the return details after processing.
          </Text>
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
