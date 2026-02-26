import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import OrdersPage from './pages/OrdersPage';
import CarliftsPage from './components/CarliftsPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/carlifts" element={<CarliftsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export function mapStatus(housemaidStatus) {
  switch (housemaidStatus) {
    case 'WITH_CLIENT': return 'Confirmed';
    case 'PENDING': return 'Pending';
    default: return 'Waiting Driver';
  }
}

export default App;
