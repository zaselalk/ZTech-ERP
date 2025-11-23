import { useState, useEffect } from "react";
import { Bookshop } from "../types";
import { Table, Button, Modal, Form, Input, message } from "antd";
import { Link } from "react-router-dom";
import { bookshopService } from "../services";
import { format } from "path";
import { formatCurrency } from "../utils";

const Bookshops = () => {
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

  const showModal = (bookshop: Bookshop | null = null): void => {
    setEditingBookshop(bookshop);
    form.setFieldsValue(
      bookshop || { name: "", location: "", contact: "", consignment: 0 }
    );
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBookshop(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();

      if (editingBookshop) {
        await bookshopService.updateBookshop(editingBookshop.id, values);
      } else {
        await bookshopService.createBookshop(values);
      }

      message.success(
        `Bookshop ${editingBookshop ? "updated" : "created"} successfully`
      );
      fetchBookshops();
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await bookshopService.deleteBookshop(id);
      message.success("Bookshop deleted successfully");
      fetchBookshops();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    {
      title: "Consignment",
      dataIndex: "consignment",
      key: "consignment",
      render: (consignment: number) => `${formatCurrency(consignment)}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Bookshop) => (
        <span>
          <Button type="link" onClick={() => showModal(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          <Link to={`/bookshops/${record.id}`}>
            <Button type="link">View Details</Button>
          </Link>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Add Bookshop
      </Button>
      <Table columns={columns} dataSource={bookshops} rowKey="id" />
      <Modal
        title={editingBookshop ? "Edit Bookshop" : "Add Bookshop"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact"
            label="Contact"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="consignment"
            label="Consignment"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Bookshops;
