import { useState, useEffect } from "react";
import { Bookshop } from "../types";
import {
  Table,
  message,
  Button,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Input,
} from "antd";
import { bookshopService } from "../services";
import dayjs from "dayjs";

const Consignments = () => {
  const [bookshops, setBookshops] = useState<Bookshop[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBookshop, setEditingBookshop] = useState<Bookshop | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBookshops();
  }, []);

  const fetchBookshops = async (): Promise<void> => {
    try {
      const data = await bookshopService.getBookshops();
      setBookshops(data);
    } catch (error) {
      message.error("Failed to fetch bookshops");
    }
  };

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
      fetchBookshops();
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const columns = [
    { title: "Bookshop", dataIndex: "name", key: "name" },
    {
      title: "Consignment Amount",
      dataIndex: "consignment",
      key: "consignment",
      render: (amount: number | string) => `LKR ${amount}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Bookshop) => (
        <Button type="primary" onClick={() => showModal(record)}>
          Record Payment
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={bookshops} rowKey="id" />
      <Modal
        title={`Record Payment for ${editingBookshop?.name || ""}`}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="amount"
            label="Amount Paid"
            rules={[{ required: true, type: "number", min: 0.01 }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) =>
                value?.replace(/\Rs.\s?|(,*)/g, "") as unknown as number
              }
            />
          </Form.Item>
          <Form.Item
            name="paymentDate"
            label="Payment Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Consignments;
