import { useState, useEffect } from "react";
import { Modal, Form, message } from "antd";
import { customerService, salesService } from "../../../services";
import { Customer, Sale } from "../../../types";
import { CartItem } from "./types";
import PaymentForm from "./PaymentForm";

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

  useEffect(() => {
    if (visible) {
      fetchCustomers();
      form.resetFields();
    }
  }, [visible]);

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
      const saleData = {
        CustomerId: values.CustomerId,
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
      message.success("Sale completed successfully");
      onSuccess(sale);
      onClose();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <Modal
      title="Finalize Sale"
      open={visible}
      onOk={handleFinalizeSale}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <PaymentForm form={form} total={total} customers={customers} />
      </Form>
    </Modal>
  );
};

export default CheckoutModal;
