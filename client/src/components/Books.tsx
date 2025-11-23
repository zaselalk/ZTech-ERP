import { useState, useEffect } from "react";
import { Book } from "../types";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";
import { Link } from "react-router-dom";
import { bookService } from "../services";
import { formatCurrency } from "../utils";

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async (): Promise<void> => {
    try {
      const data = await bookService.getBooks();
      console.log(data);
      setBooks(data);
    } catch (error) {
      message.error("Failed to fetch books");
    }
  };

  const showModal = (book: Book | null = null): void => {
    setEditingBook(book);
    form.setFieldsValue(book || {});
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBook(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();

      if (editingBook) {
        await bookService.updateBook(editingBook.id, values);
      } else {
        await bookService.createBook(values);
      }

      message.success(
        `Book ${editingBook ? "updated" : "created"} successfully`
      );
      fetchBooks();
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await bookService.deleteBook(id);
      message.success("Book deleted successfully");
      fetchBooks();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Author", dataIndex: "author", key: "author" },
    { title: "Genre", dataIndex: "genre", key: "genre" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number | string) =>
        `${formatCurrency(
          typeof price === "number" ? price : parseFloat(price)
        )}`,
    },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Book) => (
        <span>
          <Button type="link" onClick={() => showModal(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          <Link to={`/books/${record.id}`}>
            <Button type="link">View Details</Button>
          </Link>
        </span>
      ),
    },
  ];
  const filteredBooks = books.filter((book) =>
    Object.values(book).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          placeholder="Search books..."
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={() => showModal()}>
          Add Book
        </Button>
      </div>
      <Table columns={columns} dataSource={filteredBooks} rowKey="id" />
      <Modal
        title={editingBook ? "Edit Book" : "Add Book"}
        open={isModalVisible}
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
          <Form.Item
            name="barcode"
            label="Barcode"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="publisher"
            label="Publisher"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="genre" label="Genre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, type: "number" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, type: "integer" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="reorder_threshold"
            label="Reorder Threshold"
            rules={[{ required: true, type: "integer" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Books;
