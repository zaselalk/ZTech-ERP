import { useState, useEffect } from "react";
import { Table, message, Button, Modal, Form, InputNumber } from "antd";

import api from "../utils/api";

const API_URL = "http://localhost:5001/api";

const Consignments = () => {
  const [bookshops, setBookshops] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBookshop, setEditingBookshop] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBookshops();
  }, []);

  const fetchBookshops = async () => {
    try {
      const response = await api.fetch(`${API_URL}/bookshops`);
      const data = await response.json();
      setBookshops(data);
    } catch (error) {
      message.error("Failed to fetch bookshops");
    }
  };

  const showModal = (bookshop) => {
    setEditingBookshop(bookshop);
    form.setFieldsValue({ amount: 0 });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBookshop(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { amount } = values;

      if (amount <= 0) {
        message.error("Please enter a valid amount");
        return;
      }

      const response = await api.fetch(
        `${API_URL}/bookshops/${editingBookshop.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            consignment: editingBookshop.consignment - amount,
          }),
        }
      );

      if (response.ok) {
        message.success("Payment recorded successfully");
        fetchBookshops();
        handleCancel();
      } else {
        throw new Error("Failed to record payment");
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    { title: "Bookshop", dataIndex: "name", key: "name" },
    {
      title: "Consignment Amount",
      dataIndex: "consignment",
      key: "consignment",
      render: (amount) => `LKR ${amount}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
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
        title={`Record Payment for ${editingBookshop?.name}`}
        visible={isModalVisible}
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
