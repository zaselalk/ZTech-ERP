import { Layout, Menu } from 'antd';
import { useState } from 'react';
import Bookshops from './components/Bookshops';
import Books from './components/Books';
import Sales from './components/Sales';
import Reports from './components/Reports';
import Dashboard from './components/Dashboard';

const { Header, Content, Footer } = Layout;

const App = () => {
  const [selectedKey, setSelectedKey] = useState('1');

  const items = [
    { key: '1', label: 'Dashboard' },
    { key: '2', label: 'Sales' },
    { key: '3', label: 'Inventory' },
    { key: '4', label: 'Bookshops' },
    { key: '5', label: 'Reports' },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <Dashboard />;
      case '2':
        return <Sales />;
      case '3':
        return <Books />;
      case '4':
        return <Bookshops />;
      case '5':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <div className="logo" style={{ float: 'left', color: 'white', width: '120px' }}>Bookshop</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          items={items}
        />
      </Header>
      <Content style={{ padding: '50px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          {renderContent()}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Bookshop Management System ©2025 Created by Gemini
      </Footer>
    </Layout>
  );
};

export default App;

