import { useState, useEffect } from "react";
import { Modal, Form, message, Button } from "antd";
import { ShoppingOutlined, CheckCircleOutlined } from "@ant-design/icons";
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
      title={
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <ShoppingOutlined className="text-indigo-600 text-lg" />
          </div>
          <div>
            <div className="text-base font-semibold">Complete Sale</div>
            <div className="text-xs text-slate-500 font-normal">
              Review and finalize transaction
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={520}
      centered
      maskClosable={false}
      footer={
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex gap-2">
            <Button onClick={onClose} className="flex-1 h-11" size="large">
              <span className="text-sm">Cancel</span>
              <span className="text-xs text-slate-400 ml-2">Esc</span>
            </Button>
            <Button
              type="primary"
              onClick={handleFinalizeSale}
              loading={loading}
              icon={<CheckCircleOutlined />}
              className="flex-[2] h-11 text-base font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600"
              size="large"
            >
              <span>Complete Sale • {formatCurrency(total)}</span>
              <span className="text-xs opacity-75 ml-2">Ctrl+Enter</span>
            </Button>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-2">
        <PaymentForm
          form={form}
          total={total}
          customers={customers}
          cart={cart}
        />
      </Form>
    </Modal>
  );
};

export default CheckoutModal;
