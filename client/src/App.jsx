import { Layout, Menu, FloatButton } from "antd";
import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  PlusOutlined,
  BookOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  ShopOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";

import Bookshops from "./components/Bookshops";
import Books from "./components/Books";
import Sales from "./components/Sales";
import Reports from "./components/Reports";
import Dashboard from "./components/Dashboard";
import PosPage from "./pages/PosPage";
import Consignments from "./components/Consignments";
import BookshopDetails from "./components/BookshopDetails";
import BookDetails from "./components/BookDetails";

const { Header, Content, Sider } = Layout;

// The main layout for the dashboard, reports, etc.
const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine selected key from path, default to '1' (Dashboard)
  const pathMap = {
    "/": "1",
    "/sales": "2",
    "/inventory": "3",
    "/bookshops": "4",
    "/reports": "5",
    "/consignments": "6",
  };
  const [selectedKey, setSelectedKey] = useState(
    pathMap[location.pathname] || "1"
  );
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    const path = Object.keys(pathMap).find((key) => pathMap[key] === e.key);
    if (path) navigate(path);
  };

  const items = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "2",
      icon: <ShoppingCartOutlined />,
      label: "Sales History",
    },
    {
      key: "3",
      icon: <AppstoreOutlined />,
      label: "Inventory",
    },
    {
      key: "4",
      icon: <ShopOutlined />,
      label: "Bookshops",
    },
    {
      key: "5",
      icon: <BarChartOutlined />,
      label: "Reports",
    },
    {
      key: "6",
      icon: <DollarCircleOutlined />,
      label: "Consignments",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        }}
        width={250}
        collapsedWidth={80}
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 24px",
            color: "white",
            fontSize: "20px",
            fontWeight: "600",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "8px",
          }}
        >
          <BookOutlined
            style={{
              fontSize: "24px",
              marginRight: collapsed ? "0" : "12px",
            }}
          />
          {!collapsed && "Bookshop Manager"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={items}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {collapsed ? (
              <MenuUnfoldOutlined
                style={{ fontSize: "18px", cursor: "pointer", color: "#666" }}
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined
                style={{ fontSize: "18px", cursor: "pointer", color: "#666" }}
                onClick={() => setCollapsed(true)}
              />
            )}
          </div>
          <div style={{ color: "#666", fontSize: "14px" }}>Welcome back!</div>
        </Header>
        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#f5f6fa",
            borderRadius: "8px",
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/inventory" element={<Books />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/bookshops" element={<Bookshops />} />
            <Route path="/bookshops/:id" element={<BookshopDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/consignments" element={<Consignments />} />
          </Routes>
          <FloatButton
            icon={<PlusOutlined />}
            type="primary"
            tooltip="New Sale"
            onClick={() => navigate("/pos")}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

// The main App component is now just the router
const App = () => {
  return (
    <Routes>
      <Route path="/pos" element={<PosPage />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
};

export default App;
