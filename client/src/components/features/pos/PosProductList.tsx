import { Button, Typography, Empty, Spin, Card, Tag, Grid } from "antd";
import {
  PlusOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Product } from "../../../types";
import { CartItem } from "./types";
import { formatCurrency } from "../../../utils";

const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading products..." />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Empty
        image={<InboxOutlined className="text-6xl text-slate-300" />}
        imageStyle={{ height: 80 }}
        description={
          <span className="text-slate-500">
            No products found. Try a different search term.
          </span>
        }
      />
    );
  }

  // Card-based layout for better touch experience
  return (
    <div className="pos-product-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
      {products.map((product) => {
        const cartItem = cart.find((item) => item.id === product.id);
        const cartQuantity = cartItem ? cartItem.quantity : 0;
        const availableQuantity = product.quantity ?? 0;
        const remainingQuantity = availableQuantity - cartQuantity;
        const isOutOfStock = availableQuantity <= 0;
        const canAddToCart = !isOutOfStock && cartQuantity < availableQuantity;
        const isLowStock = remainingQuantity > 0 && remainingQuantity <= 5;

        return (
          <Card
            key={product.id}
            className={`pos-product-card transition-all duration-200 hover:shadow-md cursor-pointer ${
              isOutOfStock ? "opacity-60" : ""
            } ${
              cartQuantity > 0 ? "ring-2 ring-indigo-500 ring-opacity-50" : ""
            }`}
            size="small"
            onClick={() => canAddToCart && onAddToCart(product)}
            styles={{
              body: { padding: isMobile ? "12px" : "16px" },
            }}
          >
            <div className="flex flex-col h-full">
              {/* Product Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <Typography.Text
                    strong
                    className="text-base md:text-lg block truncate"
                    title={product.name}
                  >
                    {product.name}
                  </Typography.Text>
                  {product.brand && (
                    <Typography.Text
                      type="secondary"
                      className="text-xs md:text-sm"
                    >
                      {product.brand}
                    </Typography.Text>
                  )}
                </div>
                {cartQuantity > 0 && (
                  <Tag
                    color="blue"
                    className="ml-2 flex items-center gap-1 shrink-0"
                  >
                    <ShoppingCartOutlined />
                    {cartQuantity}
                  </Tag>
                )}
              </div>

              {/* Price & Stock */}
              <div className="flex justify-between items-end mt-auto pt-2">
                <div>
                  <Typography.Text
                    strong
                    className="text-lg md:text-xl text-emerald-600 block"
                  >
                    {formatCurrency(product.price)}
                  </Typography.Text>
                  <div className="flex items-center gap-2 mt-1">
                    {isOutOfStock ? (
                      <Tag color="red">Out of Stock</Tag>
                    ) : isLowStock ? (
                      <Tag color="orange">Only {remainingQuantity} left</Tag>
                    ) : (
                      <Typography.Text type="secondary" className="text-xs">
                        {remainingQuantity} available
                      </Typography.Text>
                    )}
                  </div>
                </div>

                {/* Add Button */}
                <Button
                  type={canAddToCart ? "primary" : "default"}
                  icon={<PlusOutlined />}
                  size={isMobile ? "middle" : "large"}
                  disabled={!canAddToCart}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canAddToCart) onAddToCart(product);
                  }}
                  className={`pos-add-btn ${
                    canAddToCart ? "bg-indigo-600 hover:bg-indigo-700" : ""
                  }`}
                >
                  {isOutOfStock
                    ? "Out"
                    : !canAddToCart
                    ? "Max"
                    : isMobile
                    ? ""
                    : "Add"}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PosProductList;
