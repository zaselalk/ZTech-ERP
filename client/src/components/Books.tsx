import { useState } from "react";
import { Book } from "../types";
import { Form, message } from "antd";
import { bookService } from "../services";
import { BookForm, BookTable } from "./features/books";

const Books = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [form] = Form.useForm();

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
      setRefreshTrigger((prev) => prev + 1);
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await bookService.deleteBook(id);
      message.success("Book deleted successfully");
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <div>
      <BookTable
        onEdit={showModal}
        onDelete={handleDelete}
        onAdd={() => showModal()}
        refreshTrigger={refreshTrigger}
      />
      <BookForm
        visible={isModalVisible}
        editingBook={editingBook}
        form={form}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Books;
