import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5001/api';

const Bookshops = () => {
  const [bookshops, setBookshops] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBookshop, setEditingBookshop] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBookshops();
  }, []);

  const fetchBookshops = async () => {
    try {
      const response = await fetch(`${API_URL}/bookshops`);
      const data = await response.json();
      setBookshops(data);
    } catch (error) {
      message.error('Failed to fetch bookshops');
    }
  };

  const showModal = (bookshop = null) => {
    setEditingBookshop(bookshop);
    form.setFieldsValue(bookshop || { name: '', location: '', contact: '', consignment: 0 });
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
      const method = editingBookshop ? 'PUT' : 'POST';
      const url = editingBookshop
        ? `${API_URL}/bookshops/${editingBookshop.id}`
        : `${API_URL}/bookshops`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(`Bookshop ${editingBookshop ? 'updated' : 'created'} successfully`);
        fetchBookshops();
        handleCancel();
      } else {
        throw new Error('Failed to save bookshop');
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/bookshops/${id}`, { method: 'DELETE' });
      if (response.ok) {
        message.success('Bookshop deleted successfully');
        fetchBookshops();
      } else {
        throw new Error('Failed to delete bookshop');
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Contact', dataIndex: 'contact', key: 'contact' },
    { title: 'Consignment', dataIndex: 'consignment', key: 'consignment' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => showModal(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
          <Link to={`/bookshops/${record.id}`}>
            <Button type="link">View Details</Button>
          </Link>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Add Bookshop
      </Button>
      <Table
        columns={columns}
        dataSource={bookshops}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>Consignment: {record.consignment}</p>
          ),
        }}
      />
      <Modal
        title={editingBookshop ? 'Edit Bookshop' : 'Add Bookshop'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="Contact" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="consignment" label="Consignment" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Bookshops;
