import { useState, useEffect } from "react";
import { Form, InputNumber, Switch, Button, Radio, Select } from "antd";
import {
  UserOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CarOutlined,
  InfoCircleOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import type { FormInstance } from "antd/es/form";
import { Customer } from "../../../types";
import { formatCurrency } from "../../../utils";

const { Option } = Select;

interface PaymentFormProps {
  form: FormInstance;
  total: number;
  customers: Customer[];
  cart?: { id: number; quantity: number }[];
}

const paymentMethods = [
  {
    value: "Cash",
    label: "Cash",
    icon: DollarOutlined,
    bgColor: "bg-emerald-50",
    activeColor: "bg-emerald-500",
    iconColor: "text-emerald-600",
    activeBorderColor: "border-emerald-500",
  },
  {
    value: "Card",
    label: "Card",
    icon: CreditCardOutlined,
    bgColor: "bg-blue-50",
    activeColor: "bg-blue-500",
    iconColor: "text-blue-600",
    activeBorderColor: "border-blue-500",
  },
  {
    value: "Credit",
    label: "Credit",
    icon: FileTextOutlined,
    bgColor: "bg-amber-50",
    activeColor: "bg-amber-500",
    iconColor: "text-amber-600",
    activeBorderColor: "border-amber-500",
  },
  {
    value: "Paid",
    label: "Paid",
    icon: CheckCircleOutlined,
    bgColor: "bg-violet-50",
    activeColor: "bg-violet-500",
    iconColor: "text-violet-600",
    activeBorderColor: "border-violet-500",
  },
  {
    value: "Cash On Delivery",
    label: "COD",
    icon: CarOutlined,
    bgColor: "bg-orange-50",
    activeColor: "bg-orange-500",
    iconColor: "text-orange-600",
    activeBorderColor: "border-orange-500",
  },
];

const PaymentForm = ({ form, total, customers }: PaymentFormProps) => {
  const paymentMethod = Form.useWatch("payment_method", form);
  const customerId = Form.useWatch("CustomerId", form);
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const change = amountTendered - total;

  const selectedCustomer = customers.find((c) => c.id === customerId);

  // Auto-enable customer select when Credit is chosen
  useEffect(() => {
    if (paymentMethod === "Credit" && !showCustomerSelect) {
      setShowCustomerSelect(true);
    }
  }, [paymentMethod]);

  const handleCustomerToggle = (checked: boolean) => {
    setShowCustomerSelect(checked);
    if (!checked) {
      form.setFieldValue("CustomerId", undefined);
    }
  };

  // Quick amount suggestions
  const getQuickAmounts = () => {
    const roundTo100 = Math.ceil(total / 100) * 100;
    const roundTo500 = Math.ceil(total / 500) * 500;
    const roundTo1000 = Math.ceil(total / 1000) * 1000;
    const amounts = [total, roundTo100, roundTo500, roundTo1000];
    return [...new Set(amounts)].slice(0, 4);
  };

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* LEFT COLUMN - Customer & Payment Method */}
      <div className="space-y-4">
        {/* Customer Section */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <UserOutlined className="text-slate-500 text-sm" />
              </div>
              <div>
                <p className="font-medium text-slate-800 m-0 text-sm">
                  Customer
                </p>
                <p className="text-[11px] text-slate-500 m-0">Optional</p>
              </div>
            </div>
            <Switch
              checked={showCustomerSelect}
              onChange={handleCustomerToggle}
              size="small"
              className="bg-slate-300"
            />
          </div>

          {showCustomerSelect && (
            <Form.Item name="CustomerId" className="mb-0">
              <Select
                placeholder="Search customer..."
                showSearch
                allowClear
                size="middle"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="w-full"
              >
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <WalletOutlined className="text-indigo-500" />
            Payment Method
          </p>
          <Form.Item
            name="payment_method"
            rules={[{ required: true, message: "Select a payment method" }]}
            className="mb-0"
          >
            <Radio.Group className="w-full payment-method-group">
              <div className="flex gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.value;
                  return (
                    <Radio.Button
                      key={method.value}
                      value={method.value}
                      className="payment-method-btn flex-1"
                    >
                      <div
                        className={`
                          flex flex-col items-center justify-center py-2 px-1 rounded-lg
                          border-2 transition-all duration-200 cursor-pointer h-full
                          ${
                            isSelected
                              ? `${method.bgColor} ${method.activeBorderColor}`
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }
                        `}
                      >
                        <div
                          className={`
                            w-9 h-9 rounded-lg flex items-center justify-center mb-1
                            transition-all duration-200
                            ${
                              isSelected
                                ? `${method.activeColor}`
                                : method.bgColor
                            }
                          `}
                        >
                          <Icon
                            className={`text-lg ${
                              isSelected ? "text-white" : method.iconColor
                            }`}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isSelected ? "text-slate-800" : "text-slate-600"
                          }`}
                        >
                          {method.label}
                        </span>
                      </div>
                    </Radio.Button>
                  );
                })}
              </div>
            </Radio.Group>
          </Form.Item>
        </div>

        {/* Credit Warning */}
        {paymentMethod === "Credit" && !selectedCustomer && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <InfoCircleOutlined className="text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 m-0 text-sm">
                Customer Required
              </p>
              <p className="text-amber-700 text-xs m-0">
                Select a customer for credit sales
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN - Payment Details */}
      <div className="space-y-4">
        {/* Cash Payment Section */}
        {paymentMethod === "Cash" && (
          <div className="bg-linear-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 h-full">
            <p className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
              <DollarOutlined className="text-emerald-600" />
              Cash Payment
            </p>

            {/* Quick Amounts */}
            <p className="text-xs font-medium text-emerald-700 mb-2">
              Quick Select
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {getQuickAmounts().map((amount, index) => (
                <Button
                  key={`${amount}-${index}`}
                  size="small"
                  onClick={() => setAmountTendered(amount)}
                  className={`
                    h-8 px-3 rounded-lg font-medium text-xs transition-all
                    ${
                      amountTendered === amount
                        ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600"
                        : "bg-white border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50"
                    }
                  `}
                >
                  {index === 0
                    ? "Exact"
                    : formatCurrency(amount).replace(".00", "")}
                </Button>
              ))}
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <p className="text-xs font-medium text-emerald-700 mb-1.5">
                Amount Received
              </p>
              <InputNumber
                min={0}
                className="w-full checkout-amount-input"
                size="large"
                value={amountTendered}
                onChange={(val) => setAmountTendered(val ?? 0)}
                prefix={<span className="text-slate-500">Rs.</span>}
                controls={false}
              />
            </div>

            {/* Change Display */}
            <div>
              <p className="text-xs font-medium text-emerald-700 mb-1.5">
                Change Due
              </p>
              <div
                className={`
                  h-14 rounded-xl flex items-center justify-center text-2xl font-bold
                  transition-all duration-200
                  ${
                    change >= 0
                      ? "bg-emerald-100 border-2 border-emerald-300 text-emerald-700"
                      : "bg-red-100 border-2 border-red-300 text-red-600"
                  }
                `}
              >
                {formatCurrency(change > 0 ? change : 0)}
              </div>
            </div>

            {amountTendered > 0 && amountTendered < total && (
              <p className="text-xs text-amber-600 mt-2 m-0 flex items-center gap-1">
                <InfoCircleOutlined /> Amount is less than total
              </p>
            )}
          </div>
        )}

        {/* Credit Balance Info */}
        {paymentMethod === "Credit" && selectedCustomer && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UserOutlined className="text-blue-600 text-lg" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 m-0 text-base">
                  {selectedCustomer.name}
                </p>
                <p className="text-xs text-blue-600 m-0">Credit Account</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-600 m-0 mb-1">
                  Current Credit Balance
                </p>
                <p className="text-2xl font-bold text-blue-800 m-0">
                  {formatCurrency(Number(selectedCustomer.credit_balance) || 0)}
                </p>
              </div>
              <div className="bg-blue-100/50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs text-blue-700 m-0 mb-1">
                  Balance After This Sale
                </p>
                <p className="text-2xl font-bold text-blue-900 m-0">
                  {formatCurrency(
                    (Number(selectedCustomer.credit_balance) || 0) +
                      Number(total)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card/Paid/COD - Simple confirmation */}
        {(paymentMethod === "Card" ||
          paymentMethod === "Paid" ||
          paymentMethod === "Cash On Delivery") && (
          <div
            className={`
            rounded-xl p-4 h-full flex flex-col items-center justify-center text-center
            ${
              paymentMethod === "Card"
                ? "bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200"
                : ""
            }
            ${
              paymentMethod === "Paid"
                ? "bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200"
                : ""
            }
            ${
              paymentMethod === "Cash On Delivery"
                ? "bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200"
                : ""
            }
          `}
          >
            <div
              className={`
              w-16 h-16 rounded-2xl flex items-center justify-center mb-3
              ${paymentMethod === "Card" ? "bg-blue-500" : ""}
              ${paymentMethod === "Paid" ? "bg-violet-500" : ""}
              ${paymentMethod === "Cash On Delivery" ? "bg-orange-500" : ""}
            `}
            >
              {paymentMethod === "Card" && (
                <CreditCardOutlined className="text-white text-2xl" />
              )}
              {paymentMethod === "Paid" && (
                <CheckCircleOutlined className="text-white text-2xl" />
              )}
              {paymentMethod === "Cash On Delivery" && (
                <CarOutlined className="text-white text-2xl" />
              )}
            </div>
            <p
              className={`
              font-semibold text-lg m-0 mb-1
              ${paymentMethod === "Card" ? "text-blue-800" : ""}
              ${paymentMethod === "Paid" ? "text-violet-800" : ""}
              ${paymentMethod === "Cash On Delivery" ? "text-orange-800" : ""}
            `}
            >
              {paymentMethod === "Card" && "Card Payment"}
              {paymentMethod === "Paid" && "Already Paid"}
              {paymentMethod === "Cash On Delivery" && "Cash On Delivery"}
            </p>
            <p className="text-slate-600 text-sm m-0">
              {paymentMethod === "Card" &&
                "Payment will be processed via card terminal"}
              {paymentMethod === "Paid" &&
                "Customer has already completed payment"}
              {paymentMethod === "Cash On Delivery" &&
                "Payment will be collected on delivery"}
            </p>
          </div>
        )}

        {/* Credit - No customer selected placeholder */}
        {paymentMethod === "Credit" && !selectedCustomer && (
          <div className="bg-slate-50 rounded-xl p-4 h-full flex flex-col items-center justify-center text-center border border-slate-200 border-dashed">
            <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center mb-3">
              <UserOutlined className="text-slate-400 text-xl" />
            </div>
            <p className="font-medium text-slate-600 m-0 mb-1">
              No Customer Selected
            </p>
            <p className="text-slate-500 text-sm m-0">
              Select a customer to view credit details
            </p>
          </div>
        )}

        {/* Default - No payment method selected */}
        {!paymentMethod && (
          <div className="bg-slate-50 rounded-xl p-4 h-full flex flex-col items-center justify-center text-center border border-slate-200 border-dashed">
            <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center mb-3">
              <WalletOutlined className="text-slate-400 text-xl" />
            </div>
            <p className="font-medium text-slate-600 m-0 mb-1">
              Select Payment Method
            </p>
            <p className="text-slate-500 text-sm m-0">
              Choose how the customer will pay
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
