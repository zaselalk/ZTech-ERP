import { Layout, Menu } from 'antd';
import { useState } from 'react';
import Bookshops from './components/Bookshops';
import Books from './components/Books';
import Sales from './components/Sales';
import Reports from './components/Reports';
import Dashboard from './components/Dashboard';
import { PosModal } from './components/PosModal';

const { Header, Content, Footer } = Layout;

const App = () => {
  const [selectedKey, setSelectedKey] = useState('1');
  const [isPosModalVisible, setIsPosModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Key to trigger data refresh

  const openPosModal = () => setIsPosModalVisible(true);
  const closePosModal = () => setIsPosModalVisible(false);

  const handleSaleComplete = () => {
    closePosModal();
    setRefreshKey(k => k + 1); // Increment key to force refresh
  };

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
        return <Dashboard openPosModal={openPosModal} refreshKey={refreshKey} />;
      case '2':
        return <Sales refreshKey={refreshKey} />;
      case '3':
        return <Books />;
      case '4':
        return <Bookshops />;
      case '5':
        return <Reports />;
      default:
        return <Dashboard openPosModal={openPosModal} refreshKey={refreshKey} />;
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
        <PosModal 
            visible={isPosModalVisible} 
            onClose={closePosModal} 
            onSaleComplete={handleSaleComplete} 
        />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Bookshop Management System ©2025 Created by Gemini
      </Footer>
    </Layout>
  );
};

export default App;

