import { useState, useEffect } from "react";
import { Bookshop } from "../types";
import { Table, message, Button, Modal, Form, InputNumber } from "antd";
import { bookshopService } from "../services";

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
    form.setFieldsValue({ amount: 0 });
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
      const { amount } = values as { amount: number };

      if (amount <= 0) {
        message.error("Please enter a valid amount");
        return;
      }

      const updated = await bookshopService.updateBookshop(editingBookshop.id, {
        consignment: (editingBookshop.consignment || 0) - amount,
      });

      if (updated) {
        message.success("Payment recorded successfully");
        fetchBookshops();
        handleCancel();
      } else {
        throw new Error("Failed to record payment");
      }
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
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Consignments;
