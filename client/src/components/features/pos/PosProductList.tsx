import { Table, Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Product } from "../../../types";
import { CartItem } from "./types";
import { formatCurrency } from "../../../utils";

interface PosProductListProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  loading?: boolean;
}

const PosProductList = ({
  products,
  cart,
  onAddToCart,
  loading,
}: PosProductListProps) => {
  return (
    <Table
      rowKey="id"
      pagination={false}
      dataSource={products}
      loading={loading}
      columns={[
        {
          title: "Product",
          dataIndex: "name",
          key: "name",
          render: (name: string, product) => (
            <div>
              <span className="text-base font-bold">{name}</span>
              <div>
                <Typography.Text strong className="text-sm text-[#52c41a]">
                  {formatCurrency(product.price)}
                </Typography.Text>
                {product.brand && (
                  <div className="mt-1">
                    <Typography.Text type="secondary">
                      {product.brand}
                    </Typography.Text>
                  </div>
                )}
              </div>
            </div>
          ),
        },
        {
          title: "Quantity",
          dataIndex: "quantity",
          key: "quantity",
          render: (_: unknown, product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            const cartQuantity = cartItem ? cartItem.quantity : 0;
            const availableQuantity = product.quantity ?? 0;
            const remainingQuantity = availableQuantity - cartQuantity;

            return (
              <span>
                {remainingQuantity}
                {cartQuantity > 0 && (
                  <Typography.Text type="secondary" className="ml-2">
                    ({cartQuantity} in cart)
                  </Typography.Text>
                )}
              </span>
            );
          },
        },
        {
          title: "Action",
          key: "action",
          width: 200,
          render: (_: unknown, product) => {
            const availableQuantity = product.quantity ?? 0;
            const isOutOfStock = availableQuantity <= 0;
            const cartItem = cart.find((item) => item.id === product.id);
            const cartQuantity = cartItem ? cartItem.quantity : 0;
            const canAddToCart =
              !isOutOfStock && cartQuantity < availableQuantity;

            return isOutOfStock ? (
              <Button key="out-of-stock" disabled size="large">
                Out of Stock
              </Button>
            ) : (
              <Button
                key="add"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => onAddToCart(product)}
                size="large"
                disabled={!canAddToCart}
              >
                {canAddToCart ? "Add to Cart" : "Max in Cart"}
              </Button>
            );
          },
        },
      ]}
      size="small"
    />
  );
};

export default PosProductList;
