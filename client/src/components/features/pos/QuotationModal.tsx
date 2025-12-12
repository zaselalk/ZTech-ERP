import { useState, useEffect } from "react";
import { Modal, Form, Select, DatePicker, Typography, message } from "antd";
import { bookshopService, quotationService } from "../../../services";
import { Bookshop, Quotation } from "../../../types";
import { CartItem } from "./types";
import { formatCurrency } from "../../../utils";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

interface QuotationModalProps {
  visible: boolean;
  cart: CartItem[];
  total: number;
  cartDiscountInput: number;
  cartDiscountType: "Fixed" | "Percentage";
  onClose: () => void;
  onSuccess: (quotation: Quotation) => void;
}

const QuotationModal = ({
  visible,
  cart,
  total,
  cartDiscountInput,
  cartDiscountType,
  onClose,
  onSuccess,
}: QuotationModalProps) => {
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

  const handleCreateQuotation = async () => {
    try {
      const values = await form.validateFields();
      const quotationData = {
        BookshopId: values.BookshopId,
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
        expiresAt: values.expiresAt.toISOString(),
      };

      const quotation = await quotationService.createQuotation(quotationData);
      message.success("Quotation created successfully");
      onSuccess(quotation);
      onClose();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <Modal
      title="Create Quotation"
      open={visible}
      onOk={handleCreateQuotation}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Title level={4}>Total Amount: {formatCurrency(total)}</Title>
        <Form.Item
          name="BookshopId"
          label="Bookshop"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select a bookshop">
            {bookshops.map((shop) => (
              <Option key={shop.id} value={shop.id}>
                {shop.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="expiresAt"
          label="Expiration Date"
          rules={[{ required: true }]}
        >
          <DatePicker
            className="w-full"
            disabledDate={(current) =>
              current && current < dayjs().endOf("day")
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuotationModal;
