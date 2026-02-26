import { useState, useEffect, useMemo } from 'react';
import StatsCards from '../components/StatsCards';
import Filters from '../components/Filters';
import OrdersTable from '../components/OrdersTable';
import { mapStatus } from '../App';

const API_URL = '/api/webhook/371bc76a-2ff5-42a5-bd24-b408af2e51f4';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      const content = data.content || data || [];
      setOrders(Array.isArray(content) ? content : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const confirmed = orders.filter(o => o.housemaidStatus === 'WITH_CLIENT').length;
    const pending = orders.filter(o => o.housemaidStatus === 'PENDING' || o.pendingStatus).length;
    const waiting = total - confirmed - pending;
    return { total, pending, waiting, confirmed };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.clientName?.toLowerCase().includes(q) ||
        o.housemaidName?.toLowerCase().includes(q)
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(o => {
        const status = mapStatus(o.housemaidStatus);
        return statusFilter.includes(status);
      });
    }

    if (dateRange.start) {
      filtered = filtered.filter(o => {
        const d = o.creationDate?.split(' ')[0];
        return d >= dateRange.start;
      });
    }
    if (dateRange.end) {
      filtered = filtered.filter(o => {
        const d = o.creationDate?.split(' ')[0];
        return d <= dateRange.end;
      });
    }

    return filtered;
  }, [orders, searchQuery, statusFilter, dateRange]);

  return (
    <>
      <div className="page-header">
        <h1>Dispatch Overview</h1>
        <div className="view-toggle">
          <button className="view-btn active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            List View
          </button>
          <button className="view-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
            Map View
          </button>
        </div>
      </div>
      <StatsCards stats={stats} />
      <Filters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <OrdersTable orders={filteredOrders} loading={loading} error={error} />
    </>
  );
}
