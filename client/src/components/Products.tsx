import { useState } from "react";
import { Product } from "../types";
import { Form, message } from "antd";
import { productService } from "../services";
import { ProductForm, ProductTable } from "./features/products";

const Products = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [form] = Form.useForm();

  const showModal = (product: Product | null = null): void => {
    // Ensure numeric fields are properly typed
    const productDetails = {
      ...product,
      price: product?.price ? parseFloat(product.price.toString()) : undefined,
      discount: product?.discount
        ? parseFloat(product.discount.toString())
        : undefined,
    };

    setEditingProduct(product);
    form.setFieldsValue(productDetails || {});
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();

      // Sanitize optional fields: convert empty strings to null
      const sanitizedValues = {
        ...values,
        barcode: values.barcode ? values.barcode : null,
        brand: values.brand ? values.brand : null,
        supplier: values.supplier ? values.supplier : null,
        category: values.category ? values.category : null,
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, sanitizedValues);
      } else {
        await productService.createProduct(sanitizedValues);
      }

      message.success(
        `Product ${editingProduct ? "updated" : "created"} successfully`
      );
      setRefreshTrigger((prev) => prev + 1);
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await productService.deleteProduct(id);
      message.success("Product deleted successfully");
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <div>
      <ProductTable
        onEdit={showModal}
        onDelete={handleDelete}
        onAdd={() => showModal()}
        refreshTrigger={refreshTrigger}
      />
      <ProductForm
        visible={isModalVisible}
        editingProduct={editingProduct}
        form={form}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Products;
