import { Layout, Menu, Button, Dropdown, Avatar, type MenuProps } from "antd";
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  BookOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  ShopOutlined,
  BarChartOutlined,
  DollarCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BugOutlined,
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
import LoginPage from "./pages/LoginPage";
import Backups from "./components/Backups";
import Issues from "./components/Issues";
import Users from "./components/Users";
import { authService } from "./services";

const { Header, Content, Sider } = Layout;

// The main layout for the dashboard, reports, etc.
const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine selected key from path, default to '1' (Dashboard)
  const pathMap: Record<string, string> = {
    "/": "1",
    "/sales": "2",
    "/inventory": "3",
    "/bookshops": "4",
    "/reports": "5",
    "/consignments": "6",
    "/backups": "7",
    "/issues": "8",
    "/users": "9",
  };
  const [selectedKey, setSelectedKey] = useState(
    pathMap[location.pathname] || "1"
  );
  const [collapsed, setCollapsed] = useState(false);
  const userRole = authService.getRole();
  const username = authService.getUsername();

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
    {
      key: "8",
      icon: <BugOutlined />,
      label: "Issues",
    },
  ];

  if (userRole === "admin") {
    items.push({
      key: "9",
      icon: <UserOutlined />,
      label: "Users",
    });
  }

  const handleLogout = () => {
    authService.removeToken();
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
    <Layout className="h-screen overflow-hidden">
      <Sider
        className="bg-linear-to-b! from-[#667eea]! to-[#764ba2]! shadow-[2px_0_8px_rgba(0,0,0,0.1)] h-screen overflow-y-auto"
        width={250}
      >
        <div
          className={`h-16 flex items-center text-white bg-white text-xl font-semibold border-b border-white/10 mb-2 py-12 `}
        >
          <img
            src="/logo/storyflix-logo.png"
            alt="Bookshop Logo"
            className="mx-auto mb-4 h-16"
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={items}
          className="bg-transparent border-none text-white "
        />
      </Sider>
      <Layout className="flex flex-col h-screen overflow-hidden">
        {/* Header section */}
        <Header className="bg-white! px-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-between shrink-0">
          <div className="flex items-center">
            Today is: {currentTime.toDateString()} | Time:{" "}
            {currentTime.toLocaleTimeString()}
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
                  className="bg-linear-to-br! from-[#667eea]! to-[#764ba2]! mr-2"
                />
                <span className="text-[#2c3e50] font-medium">
                  {username || "User"}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="m-6 p-6 bg-[#f5f6fa] rounded-lg overflow-y-auto flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/inventory" element={<Books />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/bookshops" element={<Bookshops />} />
            <Route path="/bookshops/:id" element={<BookshopDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/consignments" element={<Consignments />} />
            <Route path="/backups" element={<Backups />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/users" element={<Users />} />
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
