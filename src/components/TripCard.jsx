import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { suggestDrivers, suggestedPickupTime, formatTimeTo12h, addHours } from '../utils/clustering';
import DriverMessageBubble from './DriverMessageBubble';
import MaidMessageBubble from './MaidMessageBubble';
import EditOrderModal from './EditOrderModal';

function generatePickupTimes() {
  const times = [];
  for (let h = 5; h <= 11; h++) {
    for (let m = 0; m < 60; m += 15) {
      const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const label = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
      times.push({ value: time24, label });
    }
  }
  return times;
}

const PICKUP_TIMES = generatePickupTimes();

function generateAllTimes() {
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

const ALL_TIMES = generateAllTimes();

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function TripCard({ trip }) {
  const { drivers, confirmOrder, confirmTripDriver, tripAssignments, updateOrder, deleteOrder } = useApp();
  const [editingOrder, setEditingOrder] = useState(null);

  // Check if any order in this trip already has a confirmed assignment (survives re-clustering)
  const existingAssignment = useMemo(() => {
    for (const order of trip.orders) {
      const oid = order.id || order.contractId;
      if (tripAssignments[oid]) return tripAssignments[oid];
    }
    return null;
  }, [trip.orders, tripAssignments]);

  // Auto-expand if this trip has a confirmed driver (so it stays open after re-clustering)
  const [expanded, setExpanded] = useState(!!existingAssignment);

  const isConfirmed = !!existingAssignment;

  const [selectedDriverId, setSelectedDriverId] = useState(existingAssignment?.driverId || '');
  const suggestedTime = suggestedPickupTime(trip);
  const [selectedPickupTime, setSelectedPickupTime] = useState(existingAssignment?.pickupTime || suggestedTime);
  const [customPrice, setCustomPrice] = useState(existingAssignment?.driverPrice || '');
  const [orderTimes, setOrderTimes] = useState({});

  const { dutyLabel, returnLabel } = useMemo(() => {
    const dutyMinutes = [];
    const returnMinutes = [];

    trip.orders.forEach((order) => {
      const oid = order.id || order.contractId;
      const baseDuty = order.creationDate?.split(' ')[1]?.slice(0, 5) || '';
      const baseReturn = order.returnTime || '';
      const dutyVal = orderTimes[oid]?.duty || baseDuty;
      const retVal = orderTimes[oid]?.ret || baseReturn;

      if (dutyVal) {
        const [h, m] = dutyVal.split(':').map(Number);
        dutyMinutes.push(h * 60 + m);
      }
      if (retVal) {
        const [h, m] = retVal.split(':').map(Number);
        returnMinutes.push(h * 60 + m);
      }
    });

    let dutyLabel = '';
    let returnLabel = '';

    if (dutyMinutes.length > 0) {
      const mins = Math.min(...dutyMinutes);
      dutyLabel = formatTimeTo12h(minutesToTime(mins));
    }

    if (returnMinutes.length > 0) {
      const mins = Math.max(...returnMinutes);
      returnLabel = formatTimeTo12h(minutesToTime(mins));
    }

    return { dutyLabel, returnLabel };
  }, [orderTimes, trip.orders]);

  const suggestedDrivers = suggestDrivers(trip, drivers);
  const allActiveDrivers = drivers.filter(d => d.active);
  const selectedDriver = drivers.find(d => d.id === (isConfirmed ? existingAssignment.driverId : selectedDriverId)) || null;

  const pickupTimeLabel = useMemo(() => {
    const pt = isConfirmed ? existingAssignment?.pickupTime : selectedPickupTime;
    if (!pt) return trip.timeWindow;
    const found = PICKUP_TIMES.find(t => t.value === pt);
    return found ? found.label : trip.timeWindow;
  }, [selectedPickupTime, existingAssignment, isConfirmed, trip.timeWindow]);

  const tripWithPickup = useMemo(() => ({
    ...trip,
    timeWindow: pickupTimeLabel,
  }), [trip, pickupTimeLabel]);

  const activePrice = customPrice || selectedDriver?.price || suggestedDrivers[0]?.price || 0;
  const estimatedCost = activePrice * trip.seatCount;

  const handleConfirm = () => {
    if (!selectedDriverId) return;
    const driver = drivers.find(d => d.id === selectedDriverId);
    if (!driver) return;
    const orderIds = trip.orders.map(o => o.id || o.contractId);
    confirmTripDriver(orderIds, driver, selectedPickupTime);
  };

  const handleMessageSent = (order) => {
    if (!selectedDriver) return;
    confirmOrder(order, selectedDriver, tripWithPickup);
  };

  // Count how many are still unsent (not needed for disabling since orders just disappear from trip)
  const unsentCount = trip.orders.length;

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
            {trip.orders.length === 1 && (
              <>
                <button className="edit-order-btn" onClick={(e) => { e.stopPropagation(); setEditingOrder(trip.orders[0]); }} title="Edit order">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M8.5 1.5l2 2-7 7H1.5V8.5l7-7z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="delete-order-btn" onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this order?')) deleteOrder(trip.orders[0].id || trip.orders[0].contractId); }} title="Delete order">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 3h9M4.5 3V1.5h3V3M9 3v7.5H3V3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
          </div>
          <div className="trip-meta">
            <span className="trip-badge seats">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M1.5 10.5c0-2 1.8-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              {trip.seatCount} seat{trip.seatCount > 1 ? 's' : ''}
            </span>
            {suggestedTime && (
              <span className="trip-badge time">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/>
                  <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                Suggested: {PICKUP_TIMES.find(t => t.value === suggestedTime)?.label || suggestedTime}
              </span>
            )}
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
                  <th>DAYS HIRED</th>
                  <th>DUTY TIME</th>
                  <th>RETURN TIME</th>
                  <th>TO-DO LINK</th>
                </tr>
              </thead>
              <tbody>
                {trip.orders.map((order) => {
                  const oid = order.id || order.contractId;
                  const timeStr = order.creationDate?.split(' ')[1]?.slice(0, 5) || '';
                  const defaultDuty = timeStr || '';
                  const defaultReturn = order.returnTime || '';
                  const dutyVal = orderTimes[oid]?.duty ?? defaultDuty;
                  const returnVal = orderTimes[oid]?.ret ?? defaultReturn;
                  const daysHired = 0;
                  const setTime = (field, val) => setOrderTimes(prev => ({
                    ...prev,
                    [oid]: { ...prev[oid], [field]: val },
                  }));
                  return (
                    <tr key={oid}>
                      <td>
                        <div className="order-maid">
                          <span className="maid-name-text">{order.housemaidName || '—'}</span>
                          {trip.orders.length > 1 && (
                            <>
                              <button className="edit-order-btn" onClick={() => setEditingOrder(order)} title="Edit order">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M8.5 1.5l2 2-7 7H1.5V8.5l7-7z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button className="delete-order-btn" onClick={() => { if (window.confirm('Delete this order?')) deleteOrder(oid); }} title="Delete order">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M1.5 3h9M4.5 3V1.5h3V3M9 3v7.5H3V3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </>
                          )}
                          {order.housemaidPhone && (
                            <span className="maid-phone">{order.housemaidPhone}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="order-client">
                          <Link to={`/client/${encodeURIComponent(order.clientName)}`} className="client-link" style={{ fontWeight: 600 }}>
                            {order.clientName || '—'}
                          </Link>
                          <span className="client-loc">{order.clientLocation || order.clientArea || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="days-hired-badge">{daysHired} days</span>
                      </td>
                      <td>
                        <select className="inline-time-select" value={dutyVal} onChange={(e) => setTime('duty', e.target.value)}>
                          <option value="">TBD</option>
                          {ALL_TIMES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select className="inline-time-select" value={returnVal} onChange={(e) => setTime('ret', e.target.value)}>
                          <option value="">TBD</option>
                          {ALL_TIMES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <a
                          href={`https://erp.maids.cc/post-sale-services/v2/open-todo/${oid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="todo-link"
                        >
                          Open
                        </a>
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
                      onClick={() => { setSelectedDriverId(d.id); setCustomPrice(d.price); }}
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
                  onChange={(e) => {
                    setSelectedDriverId(e.target.value);
                    const d = drivers.find(dr => dr.id === e.target.value);
                    if (d) setCustomPrice(d.price);
                  }}
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
            <DriverMessageBubble
              trip={tripWithPickup}
              driver={selectedDriver}
              customPrice={Number(customPrice) || null}
              dutyTime={dutyLabel}
              returnTime={returnLabel}
            />
              )}

              {/* Pickup Time + Confirm Button */}
              <div className="confirm-row">
                <div className="pickup-time-select-group">
                  <label className="pickup-time-label">
                    Pickup Time
                    {suggestedTime && (
                      <span className="suggested-time-hint"> (suggested: {PICKUP_TIMES.find(t => t.value === suggestedTime)?.label})</span>
                    )}
                  </label>
                  <select
                    className="pickup-time-select"
                    value={selectedPickupTime}
                    onChange={(e) => setSelectedPickupTime(e.target.value)}
                  >
                    <option value="">Select pickup time...</option>
                    {PICKUP_TIMES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label}{t.value === suggestedTime ? ' ★' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pickup-time-select-group">
                  <label className="pickup-time-label">Price per seat (AED)</label>
                  <input
                    type="number"
                    className="price-input"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="e.g. 120"
                    min="0"
                  />
                </div>
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
            </div>
          )}

          {/* After confirmation: Maid messages */}
          {isConfirmed && (
            <div className="trip-maid-messages">
              <div className="confirmed-banner">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.333 4.667L6 12 2.667 8.667" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Driver confirmed: {existingAssignment?.driverName} ({existingAssignment?.driverPhone})
                {existingAssignment?.pickupTime && <> &middot; Pickup: {pickupTimeLabel}</>}
              </div>
              <div className="section-label">
                Maid Messages ({trip.orders.length} remaining)
              </div>
              {trip.orders.map((order) => {
                const orderId = order.id || order.contractId;
                return (
                  <div key={orderId} className="maid-message-row">
                    <MaidMessageBubble
                      order={order}
                      driver={selectedDriver}
                      trip={tripWithPickup}
                      customPrice={Number(customPrice) || null}
                      pickupTime={pickupTimeLabel}
                    />
                    <button
                      className="message-sent-btn"
                      onClick={() => handleMessageSent(order)}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M12.25 6.708a5.25 5.25 0 01-.788 2.754 5.322 5.322 0 01-4.733 2.913 5.25 5.25 0 01-2.754-.787L1.75 12.25l.663-2.225A5.25 5.25 0 011.625 7.27a5.322 5.322 0 012.913-4.733A5.25 5.25 0 017.292 1.75h.312a5.306 5.306 0 015.146 5.146v.312z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Message Sent
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onSave={(updates) => {
            const oid = editingOrder.id || editingOrder.contractId;
            updateOrder(oid, updates);
            setEditingOrder(null);
          }}
          onClose={() => setEditingOrder(null)}
        />
      )}
    </div>
  );
}
