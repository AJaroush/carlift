import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const DAYS = [1, 2, 3];
const FIELD_LABELS = {
  arrivalStatus: 'Arrival Status',
  actualTransport: 'Actual Transport',
  delayed: 'Delay',
  reason: 'Reason',
  notes: 'Agent Notes',
};

export default function HistoryPage() {
  const { historyOrders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return historyOrders;
    const q = searchQuery.toLowerCase();
    return historyOrders.filter(ho =>
      ho.order?.housemaidName?.toLowerCase().includes(q) ||
      ho.order?.clientName?.toLowerCase().includes(q) ||
      ho.driverName?.toLowerCase().includes(q) ||
      ho.routeLabel?.toLowerCase().includes(q)
    );
  }, [historyOrders, searchQuery]);

  if (historyOrders.length === 0) {
    return (
      <>
        <div className="page-header">
          <h1>History</h1>
        </div>
        <div className="wl-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#E2E8F0" strokeWidth="2"/>
            <path d="M16 28s2.667 4 8 4 8-4 8-4" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="18" cy="20" r="2" fill="#E2E8F0"/>
            <circle cx="30" cy="20" r="2" fill="#E2E8F0"/>
          </svg>
          <p>No completed follow-ups yet.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>History</h1>
        <div className="wl-stats-row">
          <span className="wl-stat">
            <strong>{historyOrders.length}</strong> completed
          </span>
        </div>
      </div>

      <div className="wl-search-bar">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M8.25 14.25a6 6 0 100-12 6 6 0 000 12zM15.75 15.75l-3.263-3.263" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search by maid, client, driver, or route..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="fu-cards-list">
        {filteredOrders.map((ho) => (
          <HistoryCard key={ho.orderId} ho={ho} />
        ))}
      </div>
    </>
  );
}

function HistoryCard({ ho }) {
  const order = ho.order;
  const fuData = ho.followUpData || {};
  const priority = fuData.priority || 'Normal';

  const completedDate = ho.completedAt
    ? new Date(ho.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className={`fu-card history-card fu-card-priority-${priority.toLowerCase()}`}>
      <div className="fu-card-header">
        <div className="fu-card-info-row">
          <div className="fu-card-info-item">
            <span className="fu-card-label">MAID</span>
            <span className="fu-card-maid-name">{order.housemaidName || '—'}</span>
            {order.housemaidPhone && (
              <span className="fu-card-sub">{order.housemaidPhone}</span>
            )}
          </div>
          <div className="fu-card-info-item">
            <span className="fu-card-label">CLIENT</span>
            <Link to={`/client/${encodeURIComponent(order.clientName)}`} className="client-link" style={{ fontWeight: 600 }}>
              {order.clientName || '—'}
            </Link>
            <span className="fu-card-sub">{order.clientLocation || order.clientArea || '—'}</span>
          </div>
          <div className="fu-card-info-item">
            <span className="fu-card-label">ROUTE</span>
            <span>{ho.routeLabel || '—'}</span>
            <span className="fu-card-sub">{ho.timeWindow || '—'}</span>
          </div>
          <div className="fu-card-info-item">
            <span className="fu-card-label">DRIVER</span>
            <span>{ho.driverName || '—'}</span>
            <span className="fu-card-sub">{ho.driverPhone || ''}</span>
          </div>
          <div className="fu-card-info-item">
            <span className="fu-card-label">COMPLETED</span>
            <span className="history-completed-badge">{completedDate}</span>
          </div>
          <div className="fu-card-actions-top">
            <span className={`fu-priority-btn priority-${priority.toLowerCase()}`} style={{ cursor: 'default' }}>
              {priority}
            </span>
          </div>
        </div>
      </div>

      {/* Read-only follow-up day data */}
      <div className="history-days">
        {DAYS.map(day => {
          const dayData = fuData[day];
          if (!dayData && day > 1) return null;
          return (
            <div key={day} className="history-day-block">
              <div className="history-day-label">Day {day}</div>
              <div className="history-day-grid">
                {Object.entries(FIELD_LABELS).map(([field, label]) => {
                  let value = dayData?.[field];
                  if (field === 'delayed') value = value ? 'Delayed' : 'On time';
                  return (
                    <div key={field} className="history-day-field">
                      <span className="history-field-label">{label}</span>
                      <span className="history-field-value">{value || '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
