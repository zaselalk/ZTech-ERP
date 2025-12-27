import { useState, useEffect } from "react";
import { Table, Button, Input, message } from "antd";
import { Link } from "react-router-dom";
import { Product } from "../../../types";
import { formatCurrency } from "../../../utils";
import { productService } from "../../../services";

interface ProductTableProps {
  onEdit: (product: Product) => void;
  onDelete: (id: number) => Promise<void>;
  onAdd: () => void;
  refreshTrigger?: number;
}

export const ProductTable = ({
  onEdit,
  onDelete,
  onAdd,
  refreshTrigger,
}: ProductTableProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await onDelete(id);
    fetchProducts();
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Brand", dataIndex: "brand", key: "brand" },
    { title: "Category", dataIndex: "category", key: "category" },
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
      render: (_: unknown, record: Product) => (
        <span>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          <Link to={`/products/${record.id}`}>
            <Button type="link">View Details</Button>
          </Link>
        </span>
      ),
    },
  ];

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
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
          placeholder="Search products..."
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={onAdd}>
          Add Product
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};
