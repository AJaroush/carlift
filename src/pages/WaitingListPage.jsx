import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { clusterOrders } from '../utils/clustering';
import TripCard from '../components/TripCard';

export default function WaitingListPage() {
  const { waitingOrders, loading, error, addManualOrder } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const trips = useMemo(() => clusterOrders(waitingOrders), [waitingOrders]);

  const filteredTrips = useMemo(() => {
    if (!searchQuery) return trips;
    const q = searchQuery.toLowerCase();
    return trips.filter(trip =>
      trip.routeLabel.toLowerCase().includes(q) ||
      trip.orders.some(o =>
        o.clientName?.toLowerCase().includes(q) ||
        o.housemaidName?.toLowerCase().includes(q)
      )
    );
  }, [trips, searchQuery]);

  const stats = useMemo(() => ({
    totalOrders: waitingOrders.length,
    totalTrips: trips.length,
    totalSeats: trips.reduce((sum, t) => sum + t.seatCount, 0),
  }), [waitingOrders, trips]);

  const handleAddOrder = (order) => {
    addManualOrder(order);
    setShowAddForm(false);
  };

  return (
    <>
      <div className="page-header">
        <h1>Waiting List</h1>
        <div className="wl-stats-row">
          <span className="wl-stat">
            <strong>{stats.totalOrders}</strong> orders
          </span>
          <span className="wl-stat-divider">|</span>
          <span className="wl-stat">
            <strong>{stats.totalTrips}</strong> trips
          </span>
          <span className="wl-stat-divider">|</span>
          <span className="wl-stat">
            <strong>{stats.totalSeats}</strong> seats needed
          </span>
          <button className="add-order-btn" onClick={() => setShowAddForm(true)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.75v10.5M1.75 7h10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add Order
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddOrderModal onAdd={handleAddOrder} onClose={() => setShowAddForm(false)} />
      )}

      {/* Search */}
      <div className="wl-search-bar">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M8.25 14.25a6 6 0 100-12 6 6 0 000 12zM15.75 15.75l-3.263-3.263" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search by route, client, or maid name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading && (
        <div className="wl-loading">Loading orders...</div>
      )}

      {error && (
        <div className="wl-error">Error: {error}</div>
      )}

      {!loading && !error && filteredTrips.length === 0 && (
        <div className="wl-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#E2E8F0" strokeWidth="2"/>
            <path d="M16 28s2.667 4 8 4 8-4 8-4" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="18" cy="20" r="2" fill="#E2E8F0"/>
            <circle cx="30" cy="20" r="2" fill="#E2E8F0"/>
          </svg>
          <p>No trips in waiting list</p>
        </div>
      )}

      <div className="trips-list">
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </>
  );
}

function generateTimeOptions() {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const label = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
      times.push({ value, label });
    }
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

function AddOrderModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    housemaidName: '',
    housemaidPhone: '',
    clientName: '',
    clientLocation: '',
    pickupArea: '',
    dropoffArea: '',
    dutyTime: '07:00',
    returnTime: '',
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.housemaidName || !form.clientName) return;
    const id = `MANUAL-${Date.now()}`;
    onAdd({
      id,
      contractId: id,
      clientName: form.clientName,
      clientLocation: form.clientLocation || 'N/A',
      clientArea: form.dropoffArea || 'N/A',
      housemaidName: form.housemaidName,
      housemaidPhone: form.housemaidPhone || 'N/A',
      housemaidStatus: 'PENDING',
      maidLocation: form.pickupArea || 'N/A',
      pickupArea: form.pickupArea || 'N/A',
      dropoffArea: form.dropoffArea || 'N/A',
      creationDate: new Date().toISOString().replace('T', ' ').slice(0, 11) + form.dutyTime + ':00',
      transferDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      returnTime: form.returnTime || null,
      typeOfTheContractLabel: form.pickupArea || '',
      assignee: null,
      pendingStatus: true,
      maidLat: null,
      maidLong: null,
      clientLat: null,
      clientLong: null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-order-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Order Manually</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="add-order-form">
          <div className="form-row">
            <div className="form-group">
              <label>Maid Name *</label>
              <input type="text" value={form.housemaidName} onChange={set('housemaidName')} placeholder="e.g. Maria Santos" required />
            </div>
            <div className="form-group">
              <label>Maid Phone</label>
              <input type="text" value={form.housemaidPhone} onChange={set('housemaidPhone')} placeholder="e.g. +971 50 111 1111" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Client Name *</label>
              <input type="text" value={form.clientName} onChange={set('clientName')} placeholder="e.g. Sarah Al Maktoum" required />
            </div>
            <div className="form-group">
              <label>Client Location</label>
              <input type="text" value={form.clientLocation} onChange={set('clientLocation')} placeholder="e.g. JLT Cluster D" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Pickup Area</label>
              <input type="text" value={form.pickupArea} onChange={set('pickupArea')} placeholder="e.g. Satwa" />
            </div>
            <div className="form-group">
              <label>Dropoff Area</label>
              <input type="text" value={form.dropoffArea} onChange={set('dropoffArea')} placeholder="e.g. JLT" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duty Time</label>
              <select value={form.dutyTime} onChange={set('dutyTime')}>
                {TIME_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Return Time</label>
              <select value={form.returnTime} onChange={set('returnTime')}>
                <option value="">TBD</option>
                {TIME_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Add to Waiting List</button>
          </div>
        </form>
      </div>
    </div>
  );
}
