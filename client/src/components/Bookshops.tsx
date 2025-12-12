import { useState } from "react";
import { Bookshop } from "../types";
import { Button, Form, message } from "antd";
import { bookshopService } from "../services";
import { BookshopForm, BookshopTable } from "./features/bookshops";

const Bookshops = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBookshop, setEditingBookshop] = useState<Bookshop | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [form] = Form.useForm();

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
      setRefreshTrigger((prev) => prev + 1);
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await bookshopService.deleteBookshop(id);
      message.success("Bookshop deleted successfully");
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Add Bookshop
      </Button>
      <BookshopTable
        onEdit={showModal}
        onDelete={handleDelete}
        refreshTrigger={refreshTrigger}
      />
      <BookshopForm
        visible={isModalVisible}
        editingBookshop={editingBookshop}
        form={form}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Bookshops;
