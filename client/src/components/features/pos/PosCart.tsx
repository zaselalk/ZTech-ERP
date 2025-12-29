import { useState } from "react";
import {
  Button,
  InputNumber,
  Typography,
  Select,
  Space,
  Empty,
  Divider,
  Input,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  MinusOutlined,
  PlusOutlined,
  SearchOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
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
  onQuantityChange: (productId: number, quantity: number) => void;
  onEditItem: (item: CartItem) => void;
  onCartDiscountChange: (val: number) => void;
  onCartDiscountTypeChange: (val: "Fixed" | "Percentage") => void;
  onClearCart: () => void;
  onSaveQuotation: () => void;
  onCheckout: () => void;
  onSaveToLocal: () => void;
  hasSavedCart: boolean;
  onRestoreCart: () => void;
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
  onSaveToLocal,
  hasSavedCart,
  onRestoreCart,
}: PosCartProps) => {
  const [cartSearchQuery, setCartSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const calculateItemTotal = (item: CartItem): number => {
    let priceAfterDiscount = item.price;
    if (item.discountType === "Fixed") {
      priceAfterDiscount -= item.discountValue;
    } else if (item.discountType === "Percentage") {
      priceAfterDiscount *= 1 - item.discountValue / 100;
    }
    return Math.max(0, priceAfterDiscount) * item.quantity;
  };

  const cartDiscountSelector = (
    <Select
      value={cartDiscountType}
      onChange={(val: "Fixed" | "Percentage") => onCartDiscountTypeChange(val)}
      className="!w-20"
    >
      <Option value="Fixed">LKR</Option>
      <Option value="Percentage">%</Option>
    </Select>
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter cart items based on search
  const filteredCart = cartSearchQuery
    ? cart.filter((item) =>
        item.name.toLowerCase().includes(cartSearchQuery.toLowerCase())
      )
    : cart;

  return (
    <div className="pos-cart h-full flex flex-col w-full">
      {/* Cart Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCartOutlined className="text-xl text-indigo-600" />
            <Title level={4} className="!m-0">
              Shopping Cart
            </Title>
          </div>
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <Tooltip title={isSearchVisible ? "Close search" : "Search cart"}>
              <Button
                type="text"
                size="small"
                icon={isSearchVisible ? <CloseOutlined /> : <SearchOutlined />}
                onClick={() => {
                  setIsSearchVisible(!isSearchVisible);
                  if (isSearchVisible) setCartSearchQuery("");
                }}
                className="!w-8 !h-8 !min-w-0 text-slate-500 hover:text-indigo-600"
              />
            </Tooltip>
            {/* Save to Local Storage */}
            <Tooltip title={hasSavedCart ? "Restore saved cart" : "Save cart"}>
              <Button
                type="text"
                size="small"
                icon={<SaveOutlined />}
                onClick={hasSavedCart ? onRestoreCart : onSaveToLocal}
                disabled={cart.length === 0 && !hasSavedCart}
                className={`!w-8 !h-8 !min-w-0 ${
                  hasSavedCart
                    ? "text-green-600 hover:text-green-700"
                    : "text-slate-500 hover:text-indigo-600"
                }`}
              />
            </Tooltip>
            <Text type="secondary" className="text-sm">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </Text>
          </div>
        </div>
        {/* Cart Search Input */}
        {isSearchVisible && (
          <div className="mt-3">
            <Input
              placeholder="Search items in cart..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={cartSearchQuery}
              onChange={(e) => setCartSearchQuery(e.target.value)}
              allowClear
              size="small"
              autoFocus
              className="rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Empty
              image={
                <ShoppingCartOutlined className="text-6xl text-slate-200" />
              }
              imageStyle={{ height: 80 }}
              description={
                <div className="mt-4">
                  <Text type="secondary" className="text-base">
                    Your cart is empty
                  </Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    Add products to get started
                  </Text>
                </div>
              }
            />
          </div>
        ) : (
          <div className="space-y-1">
            {filteredCart.length === 0 && cartSearchQuery ? (
              <div className="text-center py-4">
                <Text type="secondary">No items match "{cartSearchQuery}"</Text>
              </div>
            ) : null}
            {filteredCart.map((item) => (
              <div
                key={item.id}
                className="pos-cart-item-compact flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group"
              >
                {/* Quantity Stepper - Compact */}
                <div className="flex items-center shrink-0">
                  <Button
                    size="small"
                    icon={<MinusOutlined />}
                    onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 0}
                    className="!w-6 !h-6 !min-w-0 !p-0 rounded-r-none text-xs"
                  />
                  <InputNumber
                    size="small"
                    min={0}
                    max={item.availableStock}
                    value={item.quantity}
                    onChange={(val) => onQuantityChange(item.id, Number(val))}
                    className="!w-10 !h-6 text-center [&_input]:text-center [&_input]:text-xs [&_input]:p-0 rounded-none border-x-0"
                    controls={false}
                  />
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.availableStock}
                    className="!w-6 !h-6 !min-w-0 !p-0 rounded-l-none text-xs"
                  />
                </div>

                {/* Item Name & Unit Price */}
                <div className="flex-1 min-w-0">
                  <Text strong className="block truncate text-sm leading-tight">
                    {item.name}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {formatCurrency(item.price)}
                    {item.discountValue > 0 && (
                      <span className="text-green-600 ml-1">
                        (-{item.discountValue}
                        {item.discountType === "Percentage" ? "%" : ""})
                      </span>
                    )}
                  </Text>
                </div>

                {/* Total & Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Text
                    strong
                    className="text-indigo-600 text-sm whitespace-nowrap"
                  >
                    {formatCurrency(calculateItemTotal(item))}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEditItem(item)}
                    className="!w-6 !h-6 !min-w-0 !p-0 opacity-60 hover:opacity-100"
                    title="Add discount"
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onQuantityChange(item.id, 0)}
                    className="!w-6 !h-6 !min-w-0 !p-0 opacity-60 hover:opacity-100"
                    title="Remove item"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary & Actions */}
      <div className="pos-cart-summary border-t border-slate-200 bg-white p-4 md:p-5 mt-auto">
        {/* Subtotals */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <Text type="secondary">Subtotal</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </div>
          {subtotal !== subtotalAfterItemDiscounts && (
            <div className="flex justify-between text-sm">
              <Text type="secondary">After item discounts</Text>
              <Text className="text-green-600">
                {formatCurrency(subtotalAfterItemDiscounts)}
              </Text>
            </div>
          )}

          {/* Cart Discount Input */}
          <div className="flex justify-between items-center">
            <Text type="secondary" className="text-sm">
              Cart Discount
            </Text>
            <Space.Compact size="small">
              <InputNumber
                value={cartDiscountInput}
                onChange={(val) => onCartDiscountChange(val ?? 0)}
                min={0}
                className="!w-20"
              />
              {cartDiscountSelector}
            </Space.Compact>
          </div>
        </div>

        <Divider className="!my-3" />

        {/* Total */}
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="!m-0">
            Total
          </Title>
          <Title level={3} className="!m-0 text-indigo-600">
            {formatCurrency(total)}
          </Title>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button
            danger
            size="large"
            disabled={cart.length === 0}
            onClick={onClearCart}
            icon={<DeleteOutlined />}
            className="flex items-center justify-center"
          >
            Clear
          </Button>
          <Button
            size="large"
            disabled={cart.length === 0}
            onClick={onSaveQuotation}
            icon={<FileTextOutlined />}
            className="flex items-center justify-center"
          >
            Quotation
          </Button>
        </div>
        <Button
          type="primary"
          size="large"
          block
          disabled={cart.length === 0}
          onClick={onCheckout}
          icon={<CreditCardOutlined />}
          className="pos-checkout-btn h-12 text-lg font-semibold"
        >
          Checkout • {formatCurrency(total)}
        </Button>
      </div>
    </div>
  );
};

export default PosCart;
