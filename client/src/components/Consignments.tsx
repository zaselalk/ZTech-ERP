import { useState } from "react";
import { Bookshop } from "../types";
import { message, Form } from "antd";
import { bookshopService } from "../services";
import dayjs from "dayjs";
import { ConsignmentTable, PaymentModal } from "./features/consignments";

const Consignments = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBookshop, setEditingBookshop] = useState<Bookshop | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [form] = Form.useForm();

  const showModal = (bookshop: Bookshop): void => {
    setEditingBookshop(bookshop);
    form.setFieldsValue({
      amount: 0,
      paymentDate: dayjs(),
      note: "",
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBookshop(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      if (!editingBookshop) {
        message.error("No bookshop selected");
        return;
      }
      const values = await form.validateFields();

      const paymentData = {
        amount: values.amount,
        paymentDate: values.paymentDate.format("YYYY-MM-DD"),
        note: values.note,
      };

      await bookshopService.addPayment(editingBookshop.id, paymentData);

      message.success("Payment recorded successfully");
      setRefreshTrigger((prev) => prev + 1);
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <div>
      <ConsignmentTable
        onRecordPayment={showModal}
        refreshTrigger={refreshTrigger}
      />
      <PaymentModal
        visible={isModalVisible}
        bookshop={editingBookshop}
        form={form}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Consignments;
