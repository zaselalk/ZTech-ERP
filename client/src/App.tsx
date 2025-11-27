import { Layout, Menu, Button, Dropdown, Avatar, type MenuProps } from "antd";
import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  BookOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  ShopOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DollarCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import Bookshops from "./components/Bookshops";
import Books from "./components/Books";
import Sales from "./components/Sales";
import Reports from "./components/Reports";
import Dashboard from "./components/Dashboard";
import PosPage from "./pages/PosPage";
import ReceiptPage from "./pages/ReceiptPage";
import Consignments from "./components/Consignments";
import BookshopDetails from "./components/BookshopDetails";
import BookDetails from "./components/BookDetails";
import LoginPage from "./pages/LoginPage";
import Backups from "./components/Backups";

const { Header, Content, Sider } = Layout;

// The main layout for the dashboard, reports, etc.
const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine selected key from path, default to '1' (Dashboard)
  const pathMap: Record<string, string> = {
    "/": "1",
    "/sales": "2",
    "/inventory": "3",
    "/bookshops": "4",
    "/reports": "5",
    "/consignments": "6",
    "/backups": "7",
  };
  const [selectedKey, setSelectedKey] = useState(
    pathMap[location.pathname] || "1"
  );
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = (e: { key: string }) => {
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
    {
      key: "7",
      icon: <SettingOutlined />,
      label: "Backups",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      disabled: true, // Can enable later when profile page is ready
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      disabled: true, // Can enable later when settings page is ready
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="bg-linear-to-b! from-[#667eea]! to-[#764ba2]! shadow-[2px_0_8px_rgba(0,0,0,0.1)] min-h-screen"
        width={250}
        collapsedWidth={80}
      >
        <div
          className={`h-16 flex items-center text-white text-xl font-semibold border-b border-white/10 mb-2 ${
            collapsed ? "justify-center px-0" : "justify-start px-6"
          }`}
        >
          <BookOutlined className={`text-2xl ${collapsed ? "mr-0" : "mr-3"}`} />
          {!collapsed && "Bookshop Manager"}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={items}
          className="bg-transparent border-none text-white"
        />
      </Sider>
      <Layout>
        {/* Header section */}
        <Header className="bg-white! px-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-between">
          <div className="flex items-center">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="text-lg cursor-pointer text-[#666]"
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined
                className="text-lg cursor-pointer text-[#666]"
                onClick={() => setCollapsed(true)}
              />
            )}
          </div>
          <div className="flex items-center">
            <div className="text-[#666] text-sm mr-4">Welcome back!</div>
            <Button type="primary" onClick={() => navigate("/pos")}>
              New Sale
            </Button>

            {/* Profile icon section */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div className="flex items-center cursor-pointer p-1 px-3 rounded-lg transition-colors hover:bg-[#f5f5f5]">
                <Avatar
                  icon={<UserOutlined />}
                  className="!bg-gradient-to-br !from-[#667eea] !to-[#764ba2] mr-2"
                />
                <span className="text-[#2c3e50] font-medium">Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="m-6 p-6 bg-[#f5f6fa] rounded-lg">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/inventory" element={<Books />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/bookshops" element={<Bookshops />} />
            <Route path="/bookshops/:id" element={<BookshopDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/receipts/:id" element={<ReceiptPage />} />
            <Route path="/consignments" element={<Consignments />} />
            <Route path="/backups" element={<Backups />} />
          </Routes>
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
};

export default App;
