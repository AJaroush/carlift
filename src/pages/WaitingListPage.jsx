import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { clusterOrders } from '../utils/clustering';
import TripCard from '../components/TripCard';

export default function WaitingListPage() {
  const { waitingOrders, loading, error } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

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
        </div>
      </div>

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
