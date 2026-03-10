import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import EditOrderModal from '../components/EditOrderModal';

const ARRIVAL_OPTIONS = ['', 'Yes', 'No', 'Failed to reach'];
const TRANSPORT_OPTIONS = ['', 'Carlift', 'Taxi', 'Public transport', "Can't be served", 'Zone driver'];

const FIELD_LABELS = {
  arrivalStatus: 'Arrival Status',
  actualTransport: 'Actual Transport',
  delayed: 'Delay',
  reason: 'Reason',
  notes: 'Agent Notes',
};

const EMPTY_DAY = { arrivalStatus: '', actualTransport: '', delayed: false, reason: '', notes: '' };

export default function HistoryPage() {
  const { historyOrders, updateHistoryOrderData, moveHistoryToFollowUp, deleteHistoryFromContext, updateHistoryFollowUp, followUpOrders, followUpData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const transportCounts = useMemo(() => {
    const counts = { carlift: 0, publicTransport: 0, zoneDriver: 0 };
    const countTransport = (fuEntry) => {
      if (!fuEntry) return;
      const dayKeys = Object.keys(fuEntry).filter(k => !isNaN(k)).map(Number).sort((a, b) => b - a);
      for (const day of dayKeys) {
        const t = fuEntry[day]?.actualTransport;
        if (t) {
          if (t === 'Carlift') counts.carlift++;
          else if (t === 'Public transport') counts.publicTransport++;
          else if (t === 'Zone driver') counts.zoneDriver++;
          break;
        }
      }
    };
    // Count from history
    for (const ho of historyOrders) {
      countTransport(ho.followUpData);
    }
    // Count from active follow-up
    for (const fo of followUpOrders) {
      countTransport(followUpData[fo.orderId]);
    }
    return counts;
  }, [historyOrders, followUpOrders, followUpData]);

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
          <span className="wl-stat-divider">|</span>
          <span className="wl-stat" style={{ color: '#3B82F6' }}>
            <strong>{transportCounts.carlift}</strong> carlift
          </span>
          <span className="wl-stat-divider">|</span>
          <span className="wl-stat" style={{ color: '#8B5CF6' }}>
            <strong>{transportCounts.publicTransport}</strong> public transport
          </span>
          <span className="wl-stat-divider">|</span>
          <span className="wl-stat" style={{ color: '#EC4899' }}>
            <strong>{transportCounts.zoneDriver}</strong> zone driver
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
          <HistoryCard
            key={ho.orderId}
            ho={ho}
            onUpdateOrder={updateHistoryOrderData}
            onMoveToFollowUp={() => { if (window.confirm('Move this order back to Follow-Up?')) moveHistoryToFollowUp(ho.orderId); }}
            onDelete={() => { if (window.confirm('Delete this order from history? This cannot be undone.')) deleteHistoryFromContext(ho.orderId); }}
            onUpdateFollowUp={(dayUpdates) => updateHistoryFollowUp(ho.orderId, dayUpdates)}
          />
        ))}
      </div>
    </>
  );
}

function HistoryCard({ ho, onUpdateOrder, onMoveToFollowUp, onDelete, onUpdateFollowUp }) {
  const order = ho.order;
  const fuData = ho.followUpData || {};
  const priority = fuData.priority || 'Normal';
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingDays, setEditingDays] = useState(false);

  // Get all day numbers from follow-up data
  const dayNumbers = Object.keys(fuData).filter(k => !isNaN(k)).map(Number).sort((a, b) => a - b);
  const maxDay = dayNumbers.length > 0 ? Math.max(...dayNumbers) : 0;

  const [selectedDay, setSelectedDay] = useState(maxDay || 1);
  const savedDayData = fuData[selectedDay] || EMPTY_DAY;
  const [draft, setDraft] = useState({ ...EMPTY_DAY, ...savedDayData });

  const isDirty = JSON.stringify(draft) !== JSON.stringify({ ...EMPTY_DAY, ...(fuData[selectedDay] || EMPTY_DAY) });

  const handleDaySwitch = useCallback((day) => {
    setSelectedDay(day);
    const dayData = fuData[day] || EMPTY_DAY;
    setDraft({ ...EMPTY_DAY, ...dayData });
  }, [fuData]);

  const handleFieldChange = useCallback((field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onUpdateFollowUp({ [selectedDay]: { ...draft } });
  }, [onUpdateFollowUp, selectedDay, draft]);

  const dayHasData = (day) => {
    const d = fuData[day];
    if (!d) return false;
    return d.arrivalStatus || d.actualTransport || d.delayed || d.reason || d.notes;
  };

  const completedDate = ho.completedAt
    ? new Date(ho.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  // Generate day options — show all existing days + allow adding one more
  const dayOptions = [];
  const maxOption = Math.max(maxDay + 1, 1);
  for (let i = 1; i <= maxOption; i++) dayOptions.push(i);

  return (
    <div className={`fu-card history-card fu-card-priority-${priority.toLowerCase()}`}>
      <div className="fu-card-header">
        <div className="fu-card-info-row">
          <div className="fu-card-info-item">
            <span className="fu-card-label">MAID</span>
            <span className="fu-card-maid-name">
              {order.housemaidName || '—'}
              <button className="edit-order-btn" onClick={() => setEditingOrder(order)} title="Edit order">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8.5 1.5l2 2-7 7H1.5V8.5l7-7z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </span>
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
            <button className="move-back-btn" onClick={onMoveToFollowUp}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7 9.5L3.5 6 7 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Follow-Up
            </button>
            <button className="history-edit-days-btn" onClick={() => setEditingDays(!editingDays)}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5l2 2-7 7H1.5V8.5l7-7z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {editingDays ? 'Done Editing' : 'Edit Days'}
            </button>
            <button className="history-delete-btn" onClick={onDelete}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 3h9M4.5 3V1.5h3V3M9.5 3v7a1 1 0 01-1 1h-5a1 1 0 01-1-1V3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Editable follow-up days */}
      {editingDays ? (
        <div className="fu-day-fields">
          <div className="fu-day-fields-grid">
            <div className="fu-field-group">
              <label className="fu-field-label">Follow-Up Day</label>
              <select
                className="fu-select fu-day-select"
                value={selectedDay}
                onChange={(e) => handleDaySwitch(Number(e.target.value))}
              >
                {dayOptions.map(day => (
                  <option key={day} value={day}>
                    Day {day}{dayHasData(day) ? ' \u25cf' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="fu-field-group">
              <label className="fu-field-label">Arrival Status</label>
              <select
                className="fu-select"
                value={draft.arrivalStatus || ''}
                onChange={(e) => handleFieldChange('arrivalStatus', e.target.value)}
              >
                {ARRIVAL_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt || '— Select —'}</option>
                ))}
              </select>
            </div>
            <div className="fu-field-group">
              <label className="fu-field-label">Actual Transport</label>
              <select
                className="fu-select"
                value={draft.actualTransport || ''}
                onChange={(e) => handleFieldChange('actualTransport', e.target.value)}
              >
                {TRANSPORT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt || '— Select —'}</option>
                ))}
              </select>
            </div>
            <div className="fu-field-group">
              <label className="fu-field-label">Delay</label>
              <div
                className={`delay-toggle ${draft.delayed ? 'delayed' : ''}`}
                onClick={() => handleFieldChange('delayed', !draft.delayed)}
              >
                {draft.delayed ? 'Delayed' : 'On time'}
              </div>
            </div>
            <div className="fu-field-group">
              <label className="fu-field-label">Reason</label>
              <input
                type="text"
                className="fu-select"
                placeholder="Reason..."
                value={draft.reason || ''}
                onChange={(e) => handleFieldChange('reason', e.target.value)}
              />
            </div>
            <div className="fu-field-group fu-field-notes">
              <label className="fu-field-label">Agent Notes</label>
              <textarea
                className="fu-textarea"
                placeholder="Agent notes..."
                value={draft.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <div className="fu-save-row">
            <button
              className={`fu-save-btn ${isDirty ? 'has-changes' : ''}`}
              onClick={handleSave}
              disabled={!isDirty}
            >
              {isDirty ? 'Save Day ' + selectedDay : 'Saved'}
            </button>
          </div>
        </div>
      ) : (
        /* Read-only follow-up day data */
        <div className="history-days">
          {dayNumbers.map(day => {
            const dayData = fuData[day];
            if (!dayData) return null;
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
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onSave={(updates) => {
            onUpdateOrder(ho.orderId, updates);
            setEditingOrder(null);
          }}
          onClose={() => setEditingOrder(null)}
        />
      )}
    </div>
  );
}
