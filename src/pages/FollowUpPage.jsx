import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

const ARRIVAL_OPTIONS = ['', 'Yes', 'No', 'Failed to reach'];
const TRANSPORT_OPTIONS = ['', 'Carlift', 'Taxi', 'Public transport'];

export default function FollowUpPage() {
  const { confirmedTrips, followUpData, updateFollowUp, moveBackToWaiting } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = useMemo(() => {
    if (!searchQuery) return confirmedTrips;
    const q = searchQuery.toLowerCase();
    return confirmedTrips.filter(trip =>
      trip.routeLabel?.toLowerCase().includes(q) ||
      trip.driverName?.toLowerCase().includes(q) ||
      trip.orders?.some(o =>
        o.clientName?.toLowerCase().includes(q) ||
        o.housemaidName?.toLowerCase().includes(q)
      )
    );
  }, [confirmedTrips, searchQuery]);

  if (confirmedTrips.length === 0) {
    return (
      <>
        <div className="page-header">
          <h1>Follow-Up</h1>
        </div>
        <div className="wl-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#E2E8F0" strokeWidth="2"/>
            <path d="M16 28s2.667 4 8 4 8-4 8-4" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="18" cy="20" r="2" fill="#E2E8F0"/>
            <circle cx="30" cy="20" r="2" fill="#E2E8F0"/>
          </svg>
          <p>No trips in follow-up yet. Confirm drivers from the Waiting List to see them here.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Follow-Up</h1>
        <div className="wl-stats-row">
          <span className="wl-stat">
            <strong>{confirmedTrips.length}</strong> active trips
          </span>
          <span className="wl-stat-divider">|</span>
          <span className="wl-stat">
            <strong>{confirmedTrips.reduce((s, t) => s + (t.orders?.length || 0), 0)}</strong> maids
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

      <div className="followup-list">
        {filteredTrips.map((trip) => (
          <FollowUpTripCard
            key={trip.id}
            trip={trip}
            data={followUpData[trip.id] || {}}
            onUpdate={(d) => updateFollowUp(trip.id, d)}
            onMoveBack={() => moveBackToWaiting(trip.id)}
          />
        ))}
      </div>
    </>
  );
}

function FollowUpTripCard({ trip, data, onUpdate, onMoveBack }) {
  const [expanded, setExpanded] = useState(true);

  const confirmedDate = trip.confirmedAt ? new Date(trip.confirmedAt) : new Date();
  const now = new Date();
  const daysSinceConfirm = Math.max(0, Math.ceil((now - confirmedDate) / (1000 * 60 * 60 * 24)));

  const handleOrderUpdate = (orderId, field, value) => {
    const orderData = data.orders || {};
    const current = orderData[orderId] || {};
    onUpdate({
      orders: {
        ...orderData,
        [orderId]: { ...current, [field]: value },
      },
    });
  };

  const handleTransportChange = (value) => {
    onUpdate({ transportationType: value });
  };

  return (
    <div className="followup-card">
      <div className="followup-header" onClick={() => setExpanded(!expanded)}>
        <div className="followup-route-info">
          <div className="followup-route-label">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="4" cy="4" r="2.5" stroke="#3B82F6" strokeWidth="1.3"/>
              <circle cx="12" cy="12" r="2.5" stroke="#EF4444" strokeWidth="1.3"/>
              <path d="M5.5 5.5L10.5 10.5" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2"/>
            </svg>
            <span>{trip.routeLabel}</span>
          </div>
          <div className="followup-meta">
            <span className="followup-badge driver">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M1.5 10.5c0-2 1.8-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              {trip.driverName}
            </span>
            <span className="followup-badge days">Day {daysSinceConfirm}</span>
            <span className="followup-badge transport">
              {data.transportationType || trip.plannedTransportation || 'Carlift'}
            </span>
          </div>
        </div>
        <svg className={`chevron ${expanded ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {expanded && (
        <div className="followup-body">
          {/* Per-order tracking */}
          <table className="followup-table">
            <thead>
              <tr>
                <th>MAID</th>
                <th>CLIENT</th>
                <th>DAYS HIRED</th>
                <th>ARRIVAL STATUS</th>
                <th>ACTUAL TRANSPORT</th>
                <th>DELAY</th>
                <th>REASON</th>
                <th>AGENT NOTES</th>
              </tr>
            </thead>
            <tbody>
              {trip.orders?.map((order) => {
                const orderId = order.id || order.contractId;
                const orderData = (data.orders || {})[orderId] || {};

                const transferDate = order.transferDate ? new Date(order.transferDate.replace(' ', 'T')) : null;
                const daysHired = transferDate ? Math.max(0, Math.ceil((now - transferDate) / (1000 * 60 * 60 * 24))) : '—';

                return (
                  <tr key={orderId}>
                    <td>
                      <div className="fu-maid-cell">
                        <span className="fu-maid-name">{order.housemaidName || '—'}</span>
                        {order.housemaidPhone && (
                          <span className="fu-maid-phone">{order.housemaidPhone}</span>
                        )}
                      </div>
                    </td>
                    <td>{order.clientName || '—'}</td>
                    <td>
                      <span className="days-hired-badge">{daysHired} days</span>
                    </td>
                    <td>
                      <select
                        className="fu-select"
                        value={orderData.arrivalStatus || ''}
                        onChange={(e) => handleOrderUpdate(orderId, 'arrivalStatus', e.target.value)}
                      >
                        {ARRIVAL_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt || '— Select —'}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="fu-select"
                        value={orderData.actualTransport || ''}
                        onChange={(e) => handleOrderUpdate(orderId, 'actualTransport', e.target.value)}
                      >
                        {TRANSPORT_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt || '— Select —'}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div
                        className={`delay-toggle ${orderData.delayed ? 'delayed' : ''}`}
                        onClick={() => handleOrderUpdate(orderId, 'delayed', !orderData.delayed)}
                      >
                        {orderData.delayed ? 'Delayed' : 'On time'}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="fu-input"
                        placeholder="Reason..."
                        value={orderData.reason || ''}
                        onChange={(e) => handleOrderUpdate(orderId, 'reason', e.target.value)}
                      />
                    </td>
                    <td>
                      <textarea
                        className="fu-textarea"
                        placeholder="Agent notes..."
                        value={orderData.notes || ''}
                        onChange={(e) => handleOrderUpdate(orderId, 'notes', e.target.value)}
                        rows={2}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Trip-level actions */}
          <div className="followup-actions">
            <div className="fu-action-left">
              <label className="fu-transport-label">
                Planned Transportation:
                <span className="fu-planned-transport">{trip.plannedTransportation || 'Carlift'}</span>
              </label>
              <label className="fu-transport-change">
                Change to:
                <select
                  className="fu-select"
                  value={data.transportationType || ''}
                  onChange={(e) => handleTransportChange(e.target.value)}
                >
                  <option value="">Keep current</option>
                  <option value="Carlift">Carlift</option>
                  <option value="Taxi">Taxi</option>
                  <option value="Public transport">Public transport</option>
                </select>
              </label>
            </div>
            <button className="move-back-btn" onClick={onMoveBack}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8.167 11.083L4.083 7l4.084-4.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Move back to Waiting List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
