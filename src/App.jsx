import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import WaitingListPage from './pages/WaitingListPage';
import FollowUpPage from './pages/FollowUpPage';
import CarliftsPage from './components/CarliftsPage';
import ClientProfilePage from './pages/ClientProfilePage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/waiting-list" replace />} />
          <Route path="/waiting-list" element={<WaitingListPage />} />
          <Route path="/follow-up" element={<FollowUpPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/carlifts" element={<CarliftsPage />} />
          <Route path="/client/:clientName" element={<ClientProfilePage />} />
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
