import { useState, useEffect } from "react";
import { Layout, Typography, Button, Space, Result, Badge, Drawer } from "antd";
import { useNavigate } from "react-router-dom";
import {
  FileTextOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  HomeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import ReceiptModal from "../components/ReceiptModal";
import ItemDiscountModal from "../components/features/pos/ItemDiscountModal";
import PosSearch from "../components/features/pos/PosSearch";
import PosProductList from "../components/features/pos/PosProductList";
import PosCart from "../components/features/pos/PosCart";
import CheckoutModal from "../components/features/pos/CheckoutModal";
import QuotationModal from "../components/features/pos/QuotationModal";
import QuotationListModal from "../components/features/pos/QuotationListModal";
import ConvertQuotationModal from "../components/features/pos/ConvertQuotationModal";
import { usePos } from "../components/features/pos/usePos";
import { authService } from "../services";
import { usePermissions } from "../hooks/usePermissions";
import { formatCurrency } from "../utils";

const { Content } = Layout;
const { Title } = Typography;

const PosPage = () => {
  const navigate = useNavigate();
  const { canView } = usePermissions();
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check if user has access to POS
  const hasPosAccess = canView("pos");

  // Check if user has access to any admin module
  const hasAdminAccess =
    canView("dashboard") ||
    canView("sales") ||
    canView("inventory") ||
    canView("customers") ||
    canView("reports") ||
    canView("credit") ||
    canView("backups") ||
    canView("issues") ||
    canView("users") ||
    canView("settings");

  const {
    topSellers,
    cart,
    cartDiscountInput,
    cartDiscountType,
    isCheckoutVisible,
    isQuotationModalVisible,
    isQuotationListVisible,
    completedSale,
    completedQuotation,
    editingItem,
    searchResults,
    searchType,
    searchQuery,
    searchInputRef,
    loadingTopSellers,
    loadingSearch,
    subtotal,
    subtotalAfterItemDiscounts,
    total,
    hasSavedCart,
    setCartDiscountInput,
    setCartDiscountType,
    setIsCheckoutVisible,
    setIsQuotationModalVisible,
    setIsQuotationListVisible,
    setCompletedSale,
    setCompletedQuotation,
    setEditingItem,
    setSearchType,
    handleSearch,
    debouncedSearch,
    handleAddToCart,
    handleQuantityChange,
    handleItemDiscountApply,
    resetSale,
    handleClearCart,
    refreshProductData,
    saveCartToLocal,
    restoreCartFromLocal,
  } = usePos();

  // Show forbidden message if user doesn't have POS access
  if (!hasPosAccess) {
    return (
      <Layout className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you don't have permission to access the Point of Sale."
          extra={
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          }
        />
      </Layout>
    );
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Header */}
      <header className="pos-header sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-lg">
        <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingCartOutlined className="text-xl text-white" />
            </div>
            <div>
              <Title level={4} className="!text-white !m-0 hidden sm:block">
                Point of Sale
              </Title>
              <Title level={5} className="!text-white !m-0 sm:hidden">
                POS
              </Title>
            </div>
          </div>

          {/* Desktop Actions */}
          <Space className="hidden md:flex" size="middle">
            <Button
              icon={<FileTextOutlined />}
              onClick={() => setIsQuotationListVisible(true)}
              className="pos-header-btn"
            >
              Quotations
            </Button>
            {hasAdminAccess && (
              <Button
                icon={<HomeOutlined />}
                onClick={() => navigate("/")}
                className="pos-header-btn"
              >
                Dashboard
              </Button>
            )}
            {!hasAdminAccess && (
              <Button
                icon={<LogoutOutlined />}
                danger
                onClick={() => {
                  if (window.confirm("Are you sure you want to logout?")) {
                    authService.removeToken();
                    navigate("/login");
                  }
                }}
              >
                Logout
              </Button>
            )}
          </Space>

          {/* Mobile Actions */}
          <Space className="md:hidden" size="small">
            <Badge count={cartItemCount} offset={[-2, 2]}>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => setIsMobileCartOpen(true)}
                className="!bg-white/20 !border-white/30 hover:!bg-white/30"
              />
            </Badge>
            <Button
              icon={<MenuOutlined />}
              onClick={() => setIsQuotationListVisible(true)}
              className="!bg-white/20 !border-white/30 hover:!bg-white/30 !text-white"
            />
            {hasAdminAccess ? (
              <Button
                icon={<HomeOutlined />}
                onClick={() => navigate("/")}
                className="!bg-white/20 !border-white/30 hover:!bg-white/30 !text-white"
              />
            ) : (
              <Button
                icon={<LogoutOutlined />}
                danger
                onClick={() => {
                  if (window.confirm("Are you sure you want to logout?")) {
                    authService.removeToken();
                    navigate("/login");
                  }
                }}
              />
            )}
          </Space>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="pos-main-container flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Products Section */}
        <Content className="flex-1 flex flex-col p-3 md:p-4 lg:p-6 overflow-hidden">
          <div className="mb-4">
            <PosSearch
              searchQuery={searchQuery}
              searchType={searchType}
              onSearchQueryChange={debouncedSearch}
              onSearchTypeChange={setSearchType}
              onSearch={handleSearch}
              searchInputRef={searchInputRef}
            />
          </div>
          <div className="pos-product-container flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-full overflow-y-auto p-3 md:p-4">
              <PosProductList
                products={searchResults !== null ? searchResults : topSellers}
                cart={cart}
                onAddToCart={handleAddToCart}
                loading={
                  searchResults !== null ? loadingSearch : loadingTopSellers
                }
              />
            </div>
          </div>
        </Content>

        {/* Desktop Cart Sidebar */}
        <aside className="hidden lg:flex lg:w-[480px] xl:w-[520px] border-l border-slate-200 bg-white shadow-lg">
          <PosCart
            cart={cart}
            subtotal={subtotal}
            subtotalAfterItemDiscounts={subtotalAfterItemDiscounts}
            total={total}
            cartDiscountInput={cartDiscountInput}
            cartDiscountType={cartDiscountType}
            onQuantityChange={handleQuantityChange}
            onEditItem={setEditingItem}
            onCartDiscountChange={setCartDiscountInput}
            onCartDiscountTypeChange={setCartDiscountType}
            onClearCart={handleClearCart}
            onSaveQuotation={() => setIsQuotationModalVisible(true)}
            onCheckout={() => setIsCheckoutVisible(true)}
            onSaveToLocal={saveCartToLocal}
            hasSavedCart={hasSavedCart}
            onRestoreCart={restoreCartFromLocal}
          />
        </aside>

        {/* Mobile Cart Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <ShoppingCartOutlined className="text-indigo-600" />
              <span>Shopping Cart</span>
              <Badge count={cartItemCount} className="ml-2" />
            </div>
          }
          placement="right"
          width="100%"
          open={isMobileCartOpen && isMobile}
          onClose={() => setIsMobileCartOpen(false)}
          className="pos-mobile-cart-drawer"
          styles={{
            body: { padding: 0 },
            header: { borderBottom: "1px solid #f0f0f0" },
          }}
        >
          <PosCart
            cart={cart}
            subtotal={subtotal}
            subtotalAfterItemDiscounts={subtotalAfterItemDiscounts}
            total={total}
            cartDiscountInput={cartDiscountInput}
            cartDiscountType={cartDiscountType}
            onQuantityChange={handleQuantityChange}
            onEditItem={setEditingItem}
            onCartDiscountChange={setCartDiscountInput}
            onCartDiscountTypeChange={setCartDiscountType}
            onClearCart={handleClearCart}
            onSaveQuotation={() => {
              setIsMobileCartOpen(false);
              setIsQuotationModalVisible(true);
            }}
            onCheckout={() => {
              setIsMobileCartOpen(false);
              setIsCheckoutVisible(true);
            }}
            onSaveToLocal={saveCartToLocal}
            hasSavedCart={hasSavedCart}
            onRestoreCart={restoreCartFromLocal}
          />
        </Drawer>

        {/* Mobile Floating Cart Button */}
        {isMobile && cart.length > 0 && !isMobileCartOpen && (
          <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
            <Button
              type="primary"
              size="large"
              block
              onClick={() => setIsMobileCartOpen(true)}
              className="pos-mobile-cart-btn h-14 rounded-xl shadow-xl"
              icon={<ShoppingCartOutlined />}
            >
              <span className="flex items-center justify-center gap-2">
                View Cart ({cartItemCount} items) -{" "}
                <span className="font-bold">{formatCurrency(total)}</span>
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCheckoutVisible && (
        <CheckoutModal
          visible={isCheckoutVisible}
          onClose={() => setIsCheckoutVisible(false)}
          cart={cart}
          total={total}
          cartDiscountInput={cartDiscountInput}
          cartDiscountType={cartDiscountType}
          onSuccess={async (sale) => {
            setIsCheckoutVisible(false);
            setCompletedSale(sale);
            handleClearCart();
            await refreshProductData();
          }}
        />
      )}
      {isQuotationModalVisible && (
        <QuotationModal
          visible={isQuotationModalVisible}
          onClose={() => setIsQuotationModalVisible(false)}
          cart={cart}
          total={total}
          cartDiscountInput={cartDiscountInput}
          cartDiscountType={cartDiscountType}
          onSuccess={(quotation) => {
            setIsQuotationModalVisible(false);
            setCompletedQuotation(quotation);
            handleClearCart();
          }}
        />
      )}
      {isQuotationListVisible && (
        <QuotationListModal
          visible={isQuotationListVisible}
          onClose={() => setIsQuotationListVisible(false)}
          onConvert={(quotation) => {
            setIsQuotationListVisible(false);
            setCompletedQuotation(quotation);
          }}
        />
      )}
      {completedQuotation && !isQuotationListVisible && (
        <ConvertQuotationModal
          visible={!!completedQuotation}
          quotation={completedQuotation}
          onClose={() => setCompletedQuotation(null)}
          onSuccess={(sale) => {
            setCompletedQuotation(null);
            setCompletedSale(sale);
          }}
        />
      )}
      {editingItem && (
        <ItemDiscountModal
          item={editingItem}
          visible={!!editingItem}
          onApply={handleItemDiscountApply}
          onCancel={() => setEditingItem(null)}
        />
      )}
      {completedSale && (
        <ReceiptModal
          saleId={completedSale.id}
          visible={!!completedSale}
          onClose={resetSale}
        />
      )}
    </Layout>
  );
};

export default PosPage;
