import { formatCurrency } from "../utils";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin, message, Table, Typography, Button } from "antd";
import { productService } from "../services";
import { Product } from "../types";
import ReceiptModal from "./ReceiptModal";

const { Title } = Typography;

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<{
    totalSold: number;
    totalRevenue: number;
    sales: any[];
  }>({
    totalSold: 0,
    totalRevenue: 0,
    sales: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productResponse = await productService.getProductById(id!);
        setProduct(productResponse);
        const statsResponse = await productService.getProductStats(id!);
        setStats(statsResponse);
      } catch (error) {
        message.error("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Calculate top customers
  const customerMap = new Map<
    number,
    {
      customer: { id: number; name: string };
      total_quantity: number;
      date: string;
    }
  >();
  stats.sales.forEach((item: any) => {
    const customer = item.sale?.customer;
    if (customer) {
      const existing = customerMap.get(customer.id);
      if (existing) {
        existing.total_quantity += item.quantity;
        if (new Date(item.createdAt) > new Date(existing.date)) {
          existing.date = item.createdAt;
        }
      } else {
        customerMap.set(customer.id, {
          customer: { id: customer.id, name: customer.name },
          total_quantity: item.quantity,
          date: item.createdAt,
        });
      }
    }
  });
  const topCustomers = Array.from(customerMap.values()).sort(
    (a, b) => b.total_quantity - a.total_quantity
  );

  const topCustomersColumns = [
    {
      title: "Customer Name",
      dataIndex: ["customer", "name"],
      key: "customer_name",
    },
    {
      title: "Total Quantity",
      dataIndex: "total_quantity",
      key: "total_quantity",
    },
    {
      title: "Last Purchase Date",
      dataIndex: "date",
      key: "date",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ];

  const salesColumns = [
    { title: "Sale ID", dataIndex: ["sale", "id"], key: "id" },
    {
      title: "Customer",
      dataIndex: ["sale", "customer", "name"],
      key: "customer",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: any) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedSaleId(record.sale.id);
            setIsReceiptModalVisible(true);
          }}
        >
          View Receipt
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <Card title={`Product: ${product.name}`}>
        <p>
          <strong>Barcode:</strong> {product.barcode}
        </p>
        <p>
          <strong>Brand:</strong> {product.brand}
        </p>
        <p>
          <strong>Category:</strong> {product.category}
        </p>
        <p>
          <strong>Price:</strong> {formatCurrency(product.price)}
        </p>
        <p>
          <strong>Quantity:</strong> {product.quantity}
        </p>
        <p>
          <strong>Total Sold:</strong> {stats.totalSold}
        </p>
        <p>
          <strong>Total Revenue:</strong> {formatCurrency(stats.totalRevenue)}
        </p>
      </Card>

      <Title level={4} style={{ marginTop: "24px" }}>
        Customer Sales
      </Title>
      <Table
        columns={topCustomersColumns}
        dataSource={topCustomers}
        rowKey={(record) => record.customer.id}
      />

      <Title level={4} style={{ marginTop: "24px" }}>
        Recent Sales
      </Title>
      <Table columns={salesColumns} dataSource={stats.sales} rowKey="id" />

      <ReceiptModal
        saleId={selectedSaleId}
        visible={isReceiptModalVisible}
        onClose={() => setIsReceiptModalVisible(false)}
      />
    </div>
  );
};

export default ProductDetails;
