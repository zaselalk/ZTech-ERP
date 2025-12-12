import { useState, useEffect } from "react";
import { Modal, Form, message } from "antd";
import { bookshopService, salesService } from "../../../services";
import { Bookshop, Sale } from "../../../types";
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
  const [bookshops, setBookshops] = useState<Bookshop[]>([]);

  useEffect(() => {
    if (visible) {
      fetchBookshops();
      form.resetFields();
    }
  }, [visible]);

  const fetchBookshops = async () => {
    try {
      const data = await bookshopService.getBookshops();
      setBookshops(data);
    } catch (error) {
      message.error("Failed to load bookshops");
    }
  };

  const handleFinalizeSale = async () => {
    try {
      const values = await form.validateFields();
      const saleData = {
        BookshopId: values.BookshopId,
        payment_method: values.payment_method,
        items: cart.map((item) => ({
          BookId: item.id,
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
        <PaymentForm form={form} total={total} bookshops={bookshops} />
      </Form>
    </Modal>
  );
};

export default CheckoutModal;
