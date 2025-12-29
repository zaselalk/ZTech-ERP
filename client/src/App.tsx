import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Drawer,
  type MenuProps,
} from "antd";
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
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
  MenuOutlined,
} from "@ant-design/icons";

import Customers from "./components/Customers";
import Products from "./components/Products";
import Sales from "./components/Sales";
import Reports from "./components/Reports";
import Dashboard from "./components/Dashboard";
import PosPage from "./pages/PosPage";
import CreditPayments from "./components/CreditPayments";
import CustomerDetails from "./components/CustomerDetails";
import ProductDetails from "./components/ProductDetails";
import LoginPage from "./pages/LoginPage";
import Backups from "./components/Backups";
import Issues from "./components/Issues";
import Users from "./components/Users";
import Settings from "./components/Settings";
import PermissionGuard from "./components/PermissionGuard";
import { authService, settingsService } from "./services";
import { usePermissions } from "./hooks/usePermissions";
import { DateTime } from "./components/layout/Header/DateTime";
import ProtectedRoute from "./components/ProtectedRoute";
import { ModuleName } from "./types";

const { Header, Content, Sider } = Layout;

const DEFAULT_LOGO = "/logo/storyflix-logo.png";

// The main layout for the dashboard, reports, etc.
const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canView } = usePermissions();

  // Determine selected key from path, default to '1' (Dashboard)
  const pathMap: Record<string, string> = {
    "/": "1",
    "/sales": "2",
    "/inventory": "3",
    "/customers": "4",
    "/reports": "5",
    "/credit": "6",
    "/backups": "7",
    "/issues": "8",
    "/users": "9",
    "/settings": "10",
  };

  const [selectedKey, setSelectedKey] = useState(
    pathMap[location.pathname] || "1"
  );
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO);
  const username = authService.getUsername();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Check if user has access to any admin module
  const hasAnyAdminAccess =
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

  // Redirect to POS if user doesn't have access to any admin modules
  if (!hasAnyAdminAccess) {
    return <Navigate to="/pos" replace />;
  }

  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
    const path = Object.keys(pathMap).find((key) => pathMap[key] === e.key);
    if (path) navigate(path);
    setMobileMenuVisible(false); // Close mobile menu after selection
  };

  // Build menu items based on user permissions
  const allMenuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      module: "dashboard" as ModuleName,
    },
    {
      key: "2",
      icon: <ShoppingCartOutlined />,
      label: "Sales History",
      module: "sales" as ModuleName,
    },
    {
      key: "3",
      icon: <AppstoreOutlined />,
      label: "Inventory",
      module: "inventory" as ModuleName,
    },
    {
      key: "4",
      icon: <ShopOutlined />,
      label: "Customers",
      module: "customers" as ModuleName,
    },
    {
      key: "5",
      icon: <BarChartOutlined />,
      label: "Reports",
      module: "reports" as ModuleName,
    },
    {
      key: "6",
      icon: <DollarCircleOutlined />,
      label: "Credit Payments",
      module: "credit" as ModuleName,
    },
    {
      key: "7",
      icon: <SettingOutlined />,
      label: "Backups",
      module: "backups" as ModuleName,
    },
    {
      key: "8",
      icon: <BugOutlined />,
      label: "Issues",
      module: "issues" as ModuleName,
    },
    {
      key: "9",
      icon: <UserOutlined />,
      label: "Users",
      module: "users" as ModuleName,
    },
    {
      key: "10",
      icon: <SettingOutlined />,
      label: "Settings",
      module: "settings" as ModuleName,
    },
  ];

  // Filter menu items based on user permissions
  const items = allMenuItems
    .filter((item) => canView(item.module))
    .map(({ module, ...menuItem }) => menuItem);

  const handleLogout = () => {
    authService.removeToken();
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
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
      {/* Desktop Sidebar */}
      <Sider
        className="hidden lg:block bg-linear-to-b! from-[#667eea]! to-[#764ba2]! shadow-[2px_0_8px_rgba(0,0,0,0.1)] h-screen overflow-y-auto"
        width={250}
      >
        <div
          className={`h-16 flex items-center text-white bg-white text-xl font-semibold border-b border-white/10 mb-2 py-12`}
        >
          <img
            src={logoUrl}
            alt="Business Logo"
            className="mx-auto mb-4 h-16"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_LOGO;
            }}
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

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        className="lg:hidden"
        styles={{
          body: {
            padding: 0,
            background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
          },
        }}
        width={250}
      >
        <div className="h-16 flex items-center text-white bg-white text-xl font-semibold border-b border-white/10 mb-2 py-12">
          <img
            src={logoUrl}
            alt="Business Logo"
            className="mx-auto mb-4 h-16"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_LOGO;
            }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={items}
          className="bg-transparent border-none text-white"
        />
      </Drawer>

      <Layout className="flex flex-col h-screen overflow-hidden">
        {/* Header section */}
        <Header className="bg-white! px-3 sm:px-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-between shrink-0">
          {/* DateTime Component */}
          <DateTime />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block text-[#666] text-xs sm:text-sm">
              Welcome back!
            </div>
            <Button
              type="primary"
              onClick={() => navigate("/pos")}
              className="hidden sm:block text-xs sm:text-sm px-2 sm:px-4"
            >
              New Sale
            </Button>

            {/* Profile icon section */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div className="flex items-center cursor-pointer p-1 px-2 sm:px-3 rounded-lg transition-colors hover:bg-[#f5f5f5]">
                <Avatar
                  icon={<UserOutlined />}
                  className="bg-linear-to-br! from-[#667eea]! to-[#764ba2]!"
                  size="small"
                />
                <span className="hidden sm:inline text-[#2c3e50] font-medium ml-2">
                  {username || "User"}
                </span>
              </div>
            </Dropdown>

            <Button
              type="text"
              size="large"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="lg:hidden!"
            />
          </div>
        </Header>
        <Content className="m-2 sm:m-4 md:m-6 p-3 sm:p-4 md:p-6 bg-[#f5f6fa] rounded-lg overflow-y-auto flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <PermissionGuard module="dashboard">
                  <Dashboard />
                </PermissionGuard>
              }
            />
            <Route
              path="/sales"
              element={
                <PermissionGuard module="sales">
                  <Sales />
                </PermissionGuard>
              }
            />
            <Route
              path="/inventory"
              element={
                <PermissionGuard module="inventory">
                  <Products />
                </PermissionGuard>
              }
            />
            <Route
              path="/products/:id"
              element={
                <PermissionGuard module="inventory">
                  <ProductDetails />
                </PermissionGuard>
              }
            />
            <Route
              path="/customers"
              element={
                <PermissionGuard module="customers">
                  <Customers />
                </PermissionGuard>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <PermissionGuard module="customers">
                  <CustomerDetails />
                </PermissionGuard>
              }
            />
            <Route
              path="/reports"
              element={
                <PermissionGuard module="reports">
                  <Reports />
                </PermissionGuard>
              }
            />
            <Route
              path="/credit"
              element={
                <PermissionGuard module="credit">
                  <CreditPayments />
                </PermissionGuard>
              }
            />
            <Route
              path="/backups"
              element={
                <PermissionGuard module="backups">
                  <Backups />
                </PermissionGuard>
              }
            />
            <Route
              path="/issues"
              element={
                <PermissionGuard module="issues">
                  <Issues />
                </PermissionGuard>
              }
            />
            <Route
              path="/users"
              element={
                <PermissionGuard module="users">
                  <Users />
                </PermissionGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <PermissionGuard module="settings">
                  <Settings />
                </PermissionGuard>
              }
            />
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
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <PosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
