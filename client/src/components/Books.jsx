import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message } from 'antd';

const { Option } = Select;
const API_URL = 'http://localhost:5001/api';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      message.error('Failed to fetch books');
    }
  };

  

  const showModal = (book = null) => {
    setEditingBook(book);
    form.setFieldsValue(book || {});
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBook(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const method = editingBook ? 'PUT' : 'POST';
      const url = editingBook ? `${API_URL}/books/${editingBook.id}` : `${API_URL}/books`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(`Book ${editingBook ? 'updated' : 'created'} successfully`);
        fetchBooks();
        handleCancel();
      } else {
        throw new Error('Failed to save book');
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/books/${id}`, { method: 'DELETE' });
      if (response.ok) {
        message.success('Book deleted successfully');
        fetchBooks();
      } else {
        throw new Error('Failed to delete book');
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Author', dataIndex: 'author', key: 'author' },
    { title: 'Genre', dataIndex: 'genre', key: 'genre' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (price) => `LKR ${price}` },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => showModal(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Add Book
      </Button>
      <Table columns={columns} dataSource={books} rowKey="id" />
      <Modal
        title={editingBook ? 'Edit Book' : 'Add Book'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label="Author" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="barcode" label="Barcode" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="publisher" label="Publisher" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="genre" label="Genre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, type: 'number' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true, type: 'integer' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reorder_threshold" label="Reorder Threshold" rules={[{ required: true, type: 'integer' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          
        </Form>
      </Modal>
    </div>
  );
};

export default Books;
