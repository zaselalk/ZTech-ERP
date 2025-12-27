import { Modal, Form, Select, Typography, message } from "antd";
import { quotationService } from "../../../services";
import { Quotation, Sale } from "../../../types";
import { formatCurrency } from "../../../utils";

const { Title } = Typography;
const { Option } = Select;

interface ConvertQuotationModalProps {
  visible: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

const ConvertQuotationModal = ({
  visible,
  quotation,
  onClose,
  onSuccess,
}: ConvertQuotationModalProps) => {
  const [form] = Form.useForm();

  const handleConvert = async () => {
    if (!quotation) return;
    try {
      const values = await form.validateFields();
      const sale = await quotationService.convertQuotation(
        quotation.id,
        values.payment_method
      );
      message.success("Quotation converted to sale successfully");
      onSuccess(sale);
      onClose();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  if (!quotation) return null;

  return (
    <Modal
      title={`Convert Quotation #${quotation.id}`}
      open={visible}
      onOk={handleConvert}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Title level={4}>
          Total Due: {formatCurrency(quotation.total_amount)}
        </Title>
        <Form.Item
          name="payment_method"
          label="Payment Method"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select a payment method">
            <Option value="Cash">Cash</Option>
            <Option value="Card">Card</Option>
            <Option value="Credit">Credit</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConvertQuotationModal;
