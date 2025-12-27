import { useState } from "react";
import { Customer } from "../types";
import { message, Form } from "antd";
import { customerService } from "../services";
import dayjs from "dayjs";
import { CreditTable, PaymentModal } from "./features/credit";

const CreditPayments = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [form] = Form.useForm();

  const showModal = (customer: Customer): void => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      amount: 0,
      paymentDate: dayjs(),
      note: "",
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      if (!editingCustomer) {
        message.error("No customer selected");
        return;
      }
      const values = await form.validateFields();

      const paymentData = {
        amount: values.amount,
        paymentDate: values.paymentDate.format("YYYY-MM-DD"),
        note: values.note,
      };

      await customerService.addPayment(editingCustomer.id, paymentData);

      message.success("Payment recorded successfully");
      setRefreshTrigger((prev) => prev + 1);
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <div>
      <CreditTable
        onRecordPayment={showModal}
        refreshTrigger={refreshTrigger}
      />
      <PaymentModal
        visible={isModalVisible}
        customer={editingCustomer}
        form={form}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreditPayments;
