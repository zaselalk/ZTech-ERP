import { Layout, Typography, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { FileTextOutlined, LogoutOutlined } from "@ant-design/icons";
import ReceiptModal from "../components/ReceiptModal";
import ItemDiscountModal from "../components/features/pos/ItemDiscountModal";
import PosSearch from "../components/features/pos/PosSearch";
import PosBookList from "../components/features/pos/PosBookList";
import PosCart from "../components/features/pos/PosCart";
import CheckoutModal from "../components/features/pos/CheckoutModal";
import QuotationModal from "../components/features/pos/QuotationModal";
import QuotationListModal from "../components/features/pos/QuotationListModal";
import ConvertQuotationModal from "../components/features/pos/ConvertQuotationModal";
import { usePos } from "../components/features/pos/usePos";
import { authService } from "../services";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const PosPage = () => {
  const navigate = useNavigate();
  const userRole = authService.getRole();
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
    refreshBookData,
  } = usePos();

  return (
    <Layout className="min-h-screen">
      <Header className="flex justify-between items-center">
        <Title level={3} style={{ color: "white", margin: 0 }}>
          Point of Sale
        </Title>
        <Space>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => {
              setIsQuotationListVisible(true);
            }}
          >
            View Quotations
          </Button>
          {userRole === "admin" && (
            <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
          )}
          {/* show logout button for staff users */}
          {userRole === "staff" && (
            <Button
              danger
              onClick={() => {
                // ask for confirmation before logout
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
      </Header>
      <Layout className="h-[calc(100vh-64px)]">
        <Content className="p-6 flex-1 flex flex-col">
          <PosSearch
            searchQuery={searchQuery}
            searchType={searchType}
            onSearchQueryChange={debouncedSearch}
            onSearchTypeChange={setSearchType}
            onSearch={handleSearch}
            searchInputRef={searchInputRef}
          />
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              background: "white",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <PosBookList
              books={searchResults !== null ? searchResults : topSellers}
              cart={cart}
              onAddToCart={handleAddToCart}
              loading={
                searchResults !== null ? loadingSearch : loadingTopSellers
              }
            />
          </div>
        </Content>
        <Sider
          width="50%"
          theme="light"
          className="p-0 border-l border-[#f0f0f0] flex-1"
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
            onSaveQuotation={() => setIsQuotationModalVisible(true)}
            onCheckout={() => setIsCheckoutVisible(true)}
          />
        </Sider>
      </Layout>
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
            await refreshBookData();
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
