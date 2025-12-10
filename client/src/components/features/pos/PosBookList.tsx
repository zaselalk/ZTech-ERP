import { Table, Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Book } from "../../../types";
import { CartItem } from "./types";
import { formatCurrency } from "../../../utils";

interface PosBookListProps {
  books: Book[];
  cart: CartItem[];
  onAddToCart: (book: Book) => void;
  loading?: boolean;
}

const PosBookList = ({
  books,
  cart,
  onAddToCart,
  loading,
}: PosBookListProps) => {
  return (
    <Table
      rowKey="id"
      pagination={false}
      dataSource={books}
      loading={loading}
      columns={[
        {
          title: "Book",
          dataIndex: "name",
          key: "name",
          render: (name: string, book) => (
            <div>
              <span className="text-base font-bold">{name}</span>
              <div>
                <Typography.Text strong className="text-sm text-[#52c41a]">
                  {formatCurrency(book.price)}
                </Typography.Text>
                {book.author && (
                  <div className="mt-1">
                    <Typography.Text type="secondary">
                      by {book.author}
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
          render: (_: unknown, book) => {
            const cartItem = cart.find((item) => item.id === book.id);
            const cartQuantity = cartItem ? cartItem.quantity : 0;
            const availableQuantity = book.quantity ?? 0;
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
          render: (_: unknown, book) => {
            const availableQuantity = book.quantity ?? 0;
            const isOutOfStock = availableQuantity <= 0;
            const cartItem = cart.find((item) => item.id === book.id);
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
                onClick={() => onAddToCart(book)}
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

export default PosBookList;
