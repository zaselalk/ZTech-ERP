import { useState, useEffect } from "react";
import { Modal, Form, message, Button } from "antd";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { customerService, salesService } from "../../../services";
import { Customer, Sale } from "../../../types";
import { CartItem } from "./types";
import PaymentForm from "./PaymentForm";
import { formatCurrency } from "../../../utils";

interface CheckoutModalProps {
  visible: boolean;
  cart: CartItem[];
  total: number;
  cartDiscountInput: number;
  cartDiscountType: "Fixed" | "Percentage";
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

const CheckoutModal = ({
  visible,
  cart,
  total,
  cartDiscountInput,
  cartDiscountType,
  onClose,
  onSuccess,
}: CheckoutModalProps) => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCustomers();
      form.resetFields();
    }
  }, [visible]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!visible) return;

      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleFinalizeSale();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [visible, loading]);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (error) {
      message.error("Failed to load customers");
    }
  };

  const handleFinalizeSale = async () => {
    try {
      const values = await form.validateFields();

      // Validate credit sales require a customer
      if (values.payment_method === "Credit" && !values.CustomerId) {
        message.error("Please select a customer for credit sales");
        return;
      }

      setLoading(true);
      const saleData = {
        CustomerId: values.CustomerId || null,
        payment_method: values.payment_method,
        items: cart.map((item) => ({
          ProductId: item.id,
          quantity: item.quantity,
          discount: item.discountValue,
          discount_type: item.discountType,
        })),
        cartDiscount: {
          type: cartDiscountType,
          value: cartDiscountInput,
        },
      };

      const sale = await salesService.createSale(saleData);
      message.success("Sale completed successfully!");
      onSuccess(sale);
      onClose();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      width={720}
      centered
      maskClosable={false}
      closable={false}
      className="checkout-modal"
      style={{ padding: 0 }}
      footer={null}
    >
      {/* Custom Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 px-6 py-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 text-white"
        >
          <CloseOutlined className="text-sm" />
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <ShoppingOutlined className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white m-0">Checkout</h2>
              <p className="text-indigo-200 text-xs m-0">Complete your sale</p>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-indigo-200 text-xs font-medium m-0 mb-0.5">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-white m-0 tracking-tight">
                  {formatCurrency(total)}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-white text-xs font-medium">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 py-5">
        <Form form={form} layout="vertical">
          <PaymentForm
            form={form}
            total={total}
            customers={customers}
            cart={cart}
          />
        </Form>
      </div>

      {/* Footer Actions */}
      <div className="px-6 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            size="large"
            className="w-36 h-12 rounded-xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-medium"
          >
            <span className="text-slate-600">Cancel</span>
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-slate-200 text-slate-500 rounded">
              ESC
            </kbd>
          </Button>
          <Button
            type="primary"
            onClick={handleFinalizeSale}
            loading={loading}
            size="large"
            className="flex-1 h-12 rounded-xl font-semibold text-base shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 border-0"
          >
            <CheckCircleOutlined className="mr-1" />
            <span>Complete Sale • {formatCurrency(total)}</span>
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-white/20 text-white/90 rounded">
              ⌘↵
            </kbd>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckoutModal;
