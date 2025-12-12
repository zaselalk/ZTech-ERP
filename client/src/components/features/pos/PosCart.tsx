import { Table, Button, InputNumber, Typography, Select, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { CartItem } from "./types";
import { formatCurrency } from "../../../utils";

const { Text, Title } = Typography;
const { Option } = Select;

interface PosCartProps {
  cart: CartItem[];
  subtotal: number;
  subtotalAfterItemDiscounts: number;
  total: number;
  cartDiscountInput: number;
  cartDiscountType: "Fixed" | "Percentage";
  onQuantityChange: (bookId: number, quantity: number) => void;
  onEditItem: (item: CartItem) => void;
  onCartDiscountChange: (val: number) => void;
  onCartDiscountTypeChange: (val: "Fixed" | "Percentage") => void;
  onClearCart: () => void;
  onSaveQuotation: () => void;
  onCheckout: () => void;
}

const PosCart = ({
  cart,
  subtotal,
  subtotalAfterItemDiscounts,
  total,
  cartDiscountInput,
  cartDiscountType,
  onQuantityChange,
  onEditItem,
  onCartDiscountChange,
  onCartDiscountTypeChange,
  onClearCart,
  onSaveQuotation,
  onCheckout,
}: PosCartProps) => {
  const calculateItemTotal = (item: CartItem): number => {
    let priceAfterDiscount = item.price;
    if (item.discountType === "Fixed") {
      priceAfterDiscount -= item.discountValue;
    } else if (item.discountType === "Percentage") {
      priceAfterDiscount *= 1 - item.discountValue / 100;
    }
    return Math.max(0, priceAfterDiscount) * item.quantity;
  };

  const cartColumns = [
    { title: "Book", dataIndex: "name", key: "name" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (val: number | string) => formatCurrency(val),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      render: (text: number, record: CartItem) => (
        <InputNumber
          size="small"
          min={0}
          max={record.availableStock}
          value={text}
          onChange={(val) => onQuantityChange(record.id, Number(val))}
        />
      ),
    },
    {
      title: "Discount",
      key: "discount",
      render: (_: unknown, record: CartItem) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => onEditItem(record)}
        >
          {record.discountValue > 0
            ? `${record.discountValue}${
                record.discountType === "Fixed" ? "" : "%"
              }`
            : "Add"}
        </Button>
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_: unknown, record: CartItem) =>
        formatCurrency(calculateItemTotal(record)),
    },
  ];

  const cartDiscountSelector = (
    <Select
      value={cartDiscountType}
      onChange={(val: "Fixed" | "Percentage") => onCartDiscountTypeChange(val)}
    >
      <Option value="Fixed">LKR</Option>
      <Option value="Percentage">%</Option>
    </Select>
  );

  return (
    <div className="h-full flex flex-col p-6">
      <Title level={4} className="mb-4">
        Cart
      </Title>
      <div className="max-h-[calc(100vh-350px)] overflow-y-auto mb-4">
        <Table
          columns={cartColumns}
          dataSource={cart}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </div>
      <div className="mt-auto pt-4 border-t border-[#f0f0f0]">
        <div className="text-right">
          <Text strong>Subtotal: {formatCurrency(subtotal)}</Text>
          <br />
          <Text type="secondary">
            Subtotal (after item discounts):{" "}
            {formatCurrency(subtotalAfterItemDiscounts)}
          </Text>
          <div className="flex justify-end items-center mt-2">
            <Text strong className="mr-2">
              Cart Discount:
            </Text>
            <Space.Compact>
              <InputNumber
                value={cartDiscountInput}
                onChange={(val) => onCartDiscountChange(val ?? 0)}
                min={0}
              />
              {cartDiscountSelector}
            </Space.Compact>
          </div>
          <Title level={4} className="mt-2">
            Total: {formatCurrency(total)}
          </Title>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            danger
            size="large"
            disabled={cart.length === 0}
            onClick={onClearCart}
            className="flex-1"
          >
            Clear Cart
          </Button>
          <Button
            size="large"
            disabled={cart.length === 0}
            onClick={onSaveQuotation}
            className="flex-1"
          >
            Save as Quotation
          </Button>
          <Button
            type="primary"
            size="large"
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="flex-3"
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PosCart;
