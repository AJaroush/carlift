import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { suggestDrivers, formatTimeTo12h, addHours } from '../utils/clustering';
import DriverMessageBubble from './DriverMessageBubble';
import MaidMessageBubble from './MaidMessageBubble';

export default function TripCard({ trip }) {
  const { drivers, confirmTrip } = useApp();
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [messageSent, setMessageSent] = useState({});
  const [expanded, setExpanded] = useState(false);

  const suggestedDrivers = suggestDrivers(trip, drivers);
  const allActiveDrivers = drivers.filter(d => d.active);
  const selectedDriver = drivers.find(d => d.id === selectedDriverId) || null;

  const estimatedCost = selectedDriver
    ? selectedDriver.price * trip.seatCount
    : (suggestedDrivers[0]?.price || 0) * trip.seatCount;

  const handleConfirm = () => {
    if (!selectedDriverId) return;
    setIsConfirmed(true);
    confirmTrip({
      ...trip,
      driverId: selectedDriverId,
      driverName: selectedDriver?.name,
      driverPhone: selectedDriver?.phone,
      driverPrice: selectedDriver?.price,
      plannedTransportation: 'Carlift',
    });
  };

  const handleMessageSent = (orderId) => {
    setMessageSent(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div className={`trip-card ${isConfirmed ? 'confirmed' : ''}`}>
      {/* Trip Header */}
      <div className="trip-header" onClick={() => setExpanded(!expanded)}>
        <div className="trip-route-info">
          <div className="trip-route-label">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="4" cy="4" r="2.5" stroke="#3B82F6" strokeWidth="1.3"/>
              <circle cx="12" cy="12" r="2.5" stroke="#EF4444" strokeWidth="1.3"/>
              <path d="M5.5 5.5L10.5 10.5" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2"/>
            </svg>
            <span className="route-text">{trip.routeLabel}</span>
          </div>
          <div className="trip-meta">
            <span className="trip-badge seats">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M1.5 10.5c0-2 1.8-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              {trip.seatCount} seat{trip.seatCount > 1 ? 's' : ''}
            </span>
            <span className="trip-badge time">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              {trip.timeWindow}
            </span>
            {estimatedCost > 0 && (
              <span className="trip-badge cost">AED {estimatedCost}</span>
            )}
          </div>
        </div>
        <svg className={`chevron ${expanded ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {expanded && (
        <div className="trip-body">
          {/* Orders List */}
          <div className="trip-orders">
            <div className="section-label">Orders in this trip</div>
            <table className="trip-orders-table">
              <thead>
                <tr>
                  <th>MAID</th>
                  <th>CLIENT</th>
                  <th>WORKING HOURS</th>
                  <th>PICKUP TIME</th>
                </tr>
              </thead>
              <tbody>
                {trip.orders.map((order) => {
                  const timeStr = order.creationDate?.split(' ')[1]?.slice(0, 5);
                  const pickTime = formatTimeTo12h(timeStr);
                  const retTime = addHours(timeStr, 4);
                  return (
                    <tr key={order.id || order.contractId}>
                      <td>
                        <div className="order-maid">
                          <span className="maid-name-text">{order.housemaidName || '—'}</span>
                          {order.housemaidPhone && (
                            <span className="maid-phone">{order.housemaidPhone}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="order-client">
                          <span>{order.clientName || '—'}</span>
                          <span className="client-loc">{order.clientLocation || order.clientArea || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="working-hours">{pickTime} - {retTime}</span>
                      </td>
                      <td>
                        <span className="pickup-time-badge">{pickTime}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Driver Selection */}
          {!isConfirmed && (
            <div className="trip-driver-section">
              <div className="section-label">Assign Driver</div>

              {suggestedDrivers.length > 0 && (
                <div className="suggested-drivers">
                  <span className="suggested-label">Suggested:</span>
                  {suggestedDrivers.slice(0, 3).map(d => (
                    <button
                      key={d.id}
                      className={`suggested-driver-chip ${selectedDriverId === d.id ? 'selected' : ''}`}
                      onClick={() => setSelectedDriverId(d.id)}
                    >
                      <span className="sd-name">{d.name}</span>
                      <span className={`sd-reliability ${d.reliability.toLowerCase()}`}>{d.reliability}</span>
                      <span className="sd-price">AED {d.price}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="driver-select-row">
                <select
                  className="driver-select"
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                >
                  <option value="">Select a driver...</option>
                  {suggestedDrivers.length > 0 && (
                    <optgroup label="Suggested Drivers">
                      {suggestedDrivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.reliability} — AED {d.price}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="All Active Drivers">
                    {allActiveDrivers
                      .filter(d => !suggestedDrivers.some(s => s.id === d.id))
                      .map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.reliability} — AED {d.price}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Driver Message Bubble */}
              {selectedDriverId && (
                <DriverMessageBubble trip={trip} driver={selectedDriver} />
              )}

              {/* Confirm Button */}
              <button
                className="confirm-btn"
                disabled={!selectedDriverId}
                onClick={handleConfirm}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.667 4.083L5.25 10.5 2.333 7.583" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Driver Confirmed
              </button>
            </div>
          )}

          {/* After confirmation: Maid messages */}
          {isConfirmed && (
            <div className="trip-maid-messages">
              <div className="confirmed-banner">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.333 4.667L6 12 2.667 8.667" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Driver confirmed: {selectedDriver?.name} ({selectedDriver?.phone})
              </div>
              <div className="section-label">Maid Messages</div>
              {trip.orders.map((order) => {
                const orderId = order.id || order.contractId;
                return (
                  <div key={orderId} className="maid-message-row">
                    <MaidMessageBubble order={order} driver={selectedDriver} trip={trip} />
                    <label className="sent-checkbox">
                      <input
                        type="checkbox"
                        checked={!!messageSent[orderId]}
                        onChange={() => handleMessageSent(orderId)}
                      />
                      <span>Message Sent</span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
