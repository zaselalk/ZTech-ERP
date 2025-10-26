import { Layout, Menu, FloatButton } from 'antd';
import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

import Bookshops from './components/Bookshops';
import Books from './components/Books';
import Sales from './components/Sales';
import Reports from './components/Reports';
import Dashboard from './components/Dashboard';
import PosPage from './pages/PosPage';

const { Header, Content, Footer } = Layout;

// The main layout for the dashboard, reports, etc.
const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine selected key from path, default to '1' (Dashboard)
    const pathMap = {
        '/': '1',
        '/sales': '2',
        '/inventory': '3',
        '/bookshops': '4',
        '/reports': '5',
    };
    const [selectedKey, setSelectedKey] = useState(pathMap[location.pathname] || '1');

    const handleMenuClick = (e) => {
        setSelectedKey(e.key);
        const path = Object.keys(pathMap).find(key => pathMap[key] === e.key);
        if (path) navigate(path);
    }

    const items = [
        { key: '1', label: 'Dashboard' },
        { key: '2', label: 'Sales History' },
        { key: '3', label: 'Inventory' },
        { key: '4', label: 'Bookshops' },
        { key: '5', label: 'Reports' },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header>
                <div className="logo" style={{ float: 'left', color: 'white', width: '120px' }}>Bookshop</div>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[selectedKey]}
                    onClick={handleMenuClick}
                    items={items}
                />
            </Header>
            <Content style={{ padding: '50px' }}>
                <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/inventory" element={<Books />} />
                        <Route path="/bookshops" element={<Bookshops />} />
                        <Route path="/reports" element={<Reports />} />
                    </Routes>
                </div>
                <FloatButton 
                    icon={<PlusOutlined />} 
                    type="primary" 
                    tooltip="New Sale"
                    onClick={() => navigate('/pos')}
                />
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Bookshop Management System ©2025 Created by Gemini
            </Footer>
        </Layout>
    );
}

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