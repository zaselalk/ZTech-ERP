import { useState } from "react";
import { Customer } from "../types";
import { Button, Form, message } from "antd";
import { customerService } from "../services";
import { CustomerForm, CustomerTable } from "./features/customers";

const Customers = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [form] = Form.useForm();

  const showModal = (customer: Customer | null = null): void => {
    setEditingCustomer(customer);
    form.setFieldsValue(
      customer || { name: "", location: "", contact: "", consignment: 0 }
    );
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();

      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, values);
      } else {
        await customerService.createCustomer(values);
      }

      message.success(
        `Customer ${editingCustomer ? "updated" : "created"} successfully`
      );
      setRefreshTrigger((prev) => prev + 1);
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await customerService.deleteCustomer(id);
      message.success("Customer deleted successfully");
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
        Add Customer
      </Button>
      <CustomerTable
        onEdit={showModal}
        onDelete={handleDelete}
        refreshTrigger={refreshTrigger}
      />
      <CustomerForm
        visible={isModalVisible}
        editingCustomer={editingCustomer}
        form={form}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Customers;
