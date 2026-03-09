import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import EditOrderModal from '../components/EditOrderModal';

const ARRIVAL_OPTIONS = ['', 'Yes', 'No', 'Failed to reach'];
const TRANSPORT_OPTIONS = ['', 'Carlift', 'Taxi', 'Public transport', "Can't be served", 'Zone driver'];
const PRIORITY_OPTIONS = ['Normal', 'High', 'Urgent'];
const PRIORITY_ORDER = { Urgent: 0, High: 1, Normal: 2 };
const MAX_FOLLOWUP_DAYS = 30;

const EMPTY_DAY = { arrivalStatus: '', actualTransport: '', delayed: false, reason: '', notes: '' };

export default function FollowUpPage() {
  const { followUpOrders, followUpData, updateFollowUp, moveBackToWaiting, completeFollowUp, updateFollowUpOrderInContext } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('all'); // 'all', 1, 2, 3
  const [showSnoozed, setShowSnoozed] = useState(false);

  const sortedOrders = useMemo(() => {
    const now = new Date();
    const todayStrip = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const getDayForOrder = (fo) => {
      const transfer = fo.order?.transferDate ? new Date(fo.order.transferDate.replace(' ', 'T')) : null;
      if (transfer) {
        const transferStrip = new Date(transfer.getFullYear(), transfer.getMonth(), transfer.getDate());
        return Math.max(1, Math.floor((todayStrip - transferStrip) / (1000 * 60 * 60 * 24)) + 1);
      }
      const confirmed = fo.confirmedAt ? new Date(fo.confirmedAt) : null;
      if (!confirmed) return 1;
      const confirmStrip = new Date(confirmed.getFullYear(), confirmed.getMonth(), confirmed.getDate());
      return Math.max(1, Math.floor((todayStrip - confirmStrip) / (1000 * 60 * 60 * 24)) + 1);
    };

    const hasDayData = (fo) => {
      const d = followUpData[fo.orderId]?.[getDayForOrder(fo)];
      if (!d) return false;
      return !!(d.arrivalStatus || d.actualTransport || d.delayed || d.reason || d.notes);
    };

    const nowIso = new Date().toISOString();
    // Filter out snoozed orders
    const active = followUpOrders.filter(fo => !fo.order?.snoozedUntil || fo.order.snoozedUntil <= nowIso);

    return [...active].sort((a, b) => {
      // Can't-be-served goes to bottom
      const ca = a.order?.cannotBeServed ? 1 : 0;
      const cb = b.order?.cannotBeServed ? 1 : 0;
      if (ca !== cb) return ca - cb;
      // Priority first
      const pa = PRIORITY_ORDER[followUpData[a.orderId]?.priority || 'Normal'] ?? 2;
      const pb = PRIORITY_ORDER[followUpData[b.orderId]?.priority || 'Normal'] ?? 2;
      if (pa !== pb) return pa - pb;
      // Within same priority: unfollowed-up first, followed-up last
      const da = hasDayData(a) ? 1 : 0;
      const db = hasDayData(b) ? 1 : 0;
      return da - db;
    });
  }, [followUpOrders, followUpData]);

  const snoozedOrders = useMemo(() => {
    const nowIso = new Date().toISOString();
    return followUpOrders.filter(fo => fo.order?.snoozedUntil && fo.order.snoozedUntil > nowIso);
  }, [followUpOrders]);

  // Auto-escalate to Urgent any order with follow-up > 3 days
  useEffect(() => {
    const now = new Date();
    const todayStrip = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const fo of followUpOrders) {
      const currentPriority = followUpData[fo.orderId]?.priority || 'Normal';
      if (currentPriority === 'Urgent') continue;

      let followUpDays = 1;
      const transfer = fo.order?.transferDate ? new Date(fo.order.transferDate.replace(' ', 'T')) : null;
      if (transfer) {
        const transferStrip = new Date(transfer.getFullYear(), transfer.getMonth(), transfer.getDate());
        followUpDays = Math.max(1, Math.floor((todayStrip - transferStrip) / (1000 * 60 * 60 * 24)) + 1);
      } else if (fo.confirmedAt) {
        const confirmed = new Date(fo.confirmedAt);
        const confirmStrip = new Date(confirmed.getFullYear(), confirmed.getMonth(), confirmed.getDate());
        followUpDays = Math.max(1, Math.floor((todayStrip - confirmStrip) / (1000 * 60 * 60 * 24)) + 1);
      }

      if (followUpDays > 3) {
        updateFollowUp(fo.orderId, { priority: 'Urgent' });
      }
    }
  }, [followUpOrders, followUpData, updateFollowUp]);

  const getCurrentDayForOrder = useCallback((fo) => {
    const now = new Date();
    const todayStrip = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Use transferDate (how long maid has been with client) to determine follow-up day
    const transfer = fo.order?.transferDate ? new Date(fo.order.transferDate.replace(' ', 'T')) : null;
    if (!transfer) {
      // Fallback to confirmedAt
      const confirmed = fo.confirmedAt ? new Date(fo.confirmedAt) : null;
      if (!confirmed) return 1;
      const confirmStrip = new Date(confirmed.getFullYear(), confirmed.getMonth(), confirmed.getDate());
      return Math.max(1, Math.floor((todayStrip - confirmStrip) / (1000 * 60 * 60 * 24)) + 1);
    }
    const transferStrip = new Date(transfer.getFullYear(), transfer.getMonth(), transfer.getDate());
    return Math.max(1, Math.floor((todayStrip - transferStrip) / (1000 * 60 * 60 * 24)) + 1);
  }, []);

  const filteredOrders = useMemo(() => {
    let result = sortedOrders;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(fo =>
        fo.order?.housemaidName?.toLowerCase().includes(q) ||
        fo.order?.clientName?.toLowerCase().includes(q) ||
        fo.driverName?.toLowerCase().includes(q) ||
        fo.routeLabel?.toLowerCase().includes(q)
      );
    }
    if (dayFilter !== 'all') {
      result = result.filter(fo => getCurrentDayForOrder(fo) === dayFilter);
    }
    return result;
  }, [sortedOrders, searchQuery, dayFilter, getCurrentDayForOrder]);

  // Compute unique day numbers across all follow-up orders for filter buttons
  const availableDays = useMemo(() => {
    const days = new Set();
    for (const fo of followUpOrders) {
      days.add(getCurrentDayForOrder(fo));
    }
    return [...days].sort((a, b) => a - b);
  }, [followUpOrders, getCurrentDayForOrder]);

  const transportCounts = useMemo(() => {
    const counts = { carlift: 0, publicTransport: 0, zoneDriver: 0 };
    for (const fo of followUpOrders) {
      const fuEntry = followUpData[fo.orderId];
      if (!fuEntry) continue;
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
    }
    return counts;
  }, [followUpOrders, followUpData]);

  const { pending, done } = useMemo(() => {
    const now = new Date();
    const todayStrip = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const getDayForOrder = (fo) => {
      const transfer = fo.order?.transferDate ? new Date(fo.order.transferDate.replace(' ', 'T')) : null;
      if (transfer) {
        const transferStrip = new Date(transfer.getFullYear(), transfer.getMonth(), transfer.getDate());
        return Math.max(1, Math.floor((todayStrip - transferStrip) / (1000 * 60 * 60 * 24)) + 1);
      }
      const confirmed = fo.confirmedAt ? new Date(fo.confirmedAt) : null;
      if (!confirmed) return 1;
      const confirmStrip = new Date(confirmed.getFullYear(), confirmed.getMonth(), confirmed.getDate());
      return Math.max(1, Math.floor((todayStrip - confirmStrip) / (1000 * 60 * 60 * 24)) + 1);
    };

    const hasTodayData = (fo) => {
      const day = getDayForOrder(fo);
      const d = followUpData[fo.orderId]?.[day];
      if (!d) return false;
      return !!(d.arrivalStatus || d.actualTransport || d.delayed || d.reason || d.notes);
    };

    const p = [];
    const d = [];
    for (const fo of filteredOrders) {
      if (hasTodayData(fo)) d.push(fo);
      else p.push(fo);
    }
    return { pending: p, done: d };
  }, [filteredOrders, followUpData]);

  if (followUpOrders.length === 0) {
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
          <p>No maids in follow-up yet. Mark messages as sent from the Waiting List to see them here.</p>
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
            <strong>{followUpOrders.length}</strong> maid{followUpOrders.length !== 1 ? 's' : ''}
          </span>
          <span className="wl-stat-divider">|</span>
          <span className="wl-stat" style={{ color: '#F59E0B' }}>
            <strong>{pending.length}</strong> pending
          </span>
          <span className="wl-stat-divider">|</span>
          <span className="wl-stat" style={{ color: '#16A34A' }}>
            <strong>{done.length}</strong> done today
          </span>
          {snoozedOrders.length > 0 && (
            <>
              <span className="wl-stat-divider">|</span>
              <span className="wl-stat" style={{ color: '#F59E0B' }}>
                <strong>{snoozedOrders.length}</strong> snoozed
              </span>
            </>
          )}
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

      <div className="fu-toolbar">
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
        <div className="fu-day-filter">
          {['all', ...availableDays].map(d => (
            <button
              key={d}
              className={`fu-day-filter-btn${dayFilter === d ? ' active' : ''}`}
              onClick={() => setDayFilter(d)}
            >
              {d === 'all' ? 'All Days' : `Day ${d}`}
            </button>
          ))}
          {snoozedOrders.length > 0 && (
            <button
              className={`fu-day-filter-btn snoozed-toggle${showSnoozed ? ' active' : ''}`}
              onClick={() => setShowSnoozed(prev => !prev)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/><path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
              Snoozed ({snoozedOrders.length})
            </button>
          )}
        </div>
      </div>

      <div className="fu-cards-list">
        {showSnoozed ? (
          <>
            <div className="fu-section-header snoozed">
              <span className="fu-section-dot snoozed" />
              Snoozed ({snoozedOrders.length})
            </div>
            {snoozedOrders.map((fo) => (
              <FollowUpCard
                key={fo.orderId}
                fo={fo}
                data={followUpData[fo.orderId] || {}}
                onSave={(d) => updateFollowUp(fo.orderId, d)}
                onMoveBack={() => moveBackToWaiting(fo.orderId)}
                onPriorityChange={(p) => updateFollowUp(fo.orderId, { priority: p })}
                onComplete={() => { if (window.confirm('Mark this maid as follow-up complete? She will be moved to History.')) completeFollowUp(fo.orderId); }}
                onUpdateOrder={(updates) => updateFollowUpOrderInContext(fo.orderId, updates)}
                snoozedUntil={fo.order?.snoozedUntil}
              />
            ))}
          </>
        ) : (
          <>
        {pending.length > 0 && (
          <div className="fu-section-header pending">
            <span className="fu-section-dot pending" />
            Needs Follow-Up Today ({pending.length})
          </div>
        )}
        {pending.map((fo) => (
          <FollowUpCard
            key={fo.orderId}
            fo={fo}
            data={followUpData[fo.orderId] || {}}
            onSave={(d) => updateFollowUp(fo.orderId, d)}
            onMoveBack={() => moveBackToWaiting(fo.orderId)}
            onPriorityChange={(p) => updateFollowUp(fo.orderId, { priority: p })}
            onComplete={() => { if (window.confirm('Mark this maid as follow-up complete? She will be moved to History.')) completeFollowUp(fo.orderId); }}
            onUpdateOrder={(updates) => updateFollowUpOrderInContext(fo.orderId, updates)}
          />
        ))}

        {pending.length > 0 && done.length > 0 && (
          <div className="fu-section-divider" />
        )}

        {done.length > 0 && (
          <div className="fu-section-header done">
            <span className="fu-section-dot done" />
            Followed Up Today ({done.length})
          </div>
        )}
        {done.map((fo) => (
          <FollowUpCard
            key={fo.orderId}
            fo={fo}
            data={followUpData[fo.orderId] || {}}
            onSave={(d) => updateFollowUp(fo.orderId, d)}
            onMoveBack={() => moveBackToWaiting(fo.orderId)}
            onPriorityChange={(p) => updateFollowUp(fo.orderId, { priority: p })}
            onComplete={() => { if (window.confirm('Mark this maid as follow-up complete? She will be moved to History.')) completeFollowUp(fo.orderId); }}
            onUpdateOrder={(updates) => updateFollowUpOrderInContext(fo.orderId, updates)}
          />
        ))}
          </>
        )}
      </div>
    </>
  );
}

const PRESET_REASONS = ["Couldn't find carlift", 'Maid decided public transport'];

function ReasonField({ reason, onChange }) {
  const isPreset = PRESET_REASONS.includes(reason);
  const [isOther, setIsOther] = useState(!isPreset && reason !== '' && reason != null);

  const selectValue = isPreset ? reason : isOther ? 'Other' : '';

  return (
    <div className="fu-field-group">
      <label className="fu-field-label">Reason</label>
      <select
        className="fu-select"
        value={selectValue}
        onChange={(e) => {
          const val = e.target.value;
          if (val === 'Other') {
            setIsOther(true);
            onChange('');
          } else {
            setIsOther(false);
            onChange(val);
          }
        }}
      >
        <option value="">— Select —</option>
        <option value="Couldn't find carlift">Couldn't find carlift</option>
        <option value="Maid decided public transport">Maid decided public transport</option>
        <option value="Other">Other</option>
      </select>
      {isOther && (
        <input
          type="text"
          className="fu-input"
          placeholder="Specify reason..."
          value={reason || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginTop: 6 }}
        />
      )}
    </div>
  );
}

function SnoozePopover({ onSnooze, onClose }) {
  const [date, setDate] = useState('');
  return (
    <div className="snooze-popover" onClick={e => e.stopPropagation()}>
      <label className="snooze-label">Snooze until:</label>
      <input type="datetime-local" className="snooze-input" value={date} onChange={e => setDate(e.target.value)} />
      <div className="snooze-actions">
        <button className="snooze-cancel" onClick={onClose}>Cancel</button>
        <button className="snooze-confirm" disabled={!date} onClick={() => { onSnooze(new Date(date).toISOString()); onClose(); }}>Snooze</button>
      </div>
    </div>
  );
}

function FollowUpCard({ fo, data, onSave, onMoveBack, onPriorityChange, onComplete, onUpdateOrder, snoozedUntil }) {
  const order = fo.order;
  const [editingOrder, setEditingOrder] = useState(null);
  const [showSnooze, setShowSnooze] = useState(false);
  const now = new Date();

  const transferDate = order.transferDate ? new Date(order.transferDate.replace(' ', 'T')) : null;
  const daysHired = transferDate ? Math.max(0, Math.ceil((now - transferDate) / (1000 * 60 * 60 * 24))) : '—';

  // Calculate follow-up day based on transferDate (how long maid has been with client)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let followUpDays = 1;
  if (transferDate) {
    const transferStrip = new Date(transferDate.getFullYear(), transferDate.getMonth(), transferDate.getDate());
    followUpDays = Math.max(1, Math.floor((today - transferStrip) / (1000 * 60 * 60 * 24)) + 1);
  } else if (fo.confirmedAt) {
    const confirmedDate = new Date(fo.confirmedAt);
    const confirmedDay = new Date(confirmedDate.getFullYear(), confirmedDate.getMonth(), confirmedDate.getDate());
    followUpDays = Math.max(1, Math.floor((today - confirmedDay) / (1000 * 60 * 60 * 24)) + 1);
  }

  const priority = data.priority || 'Normal';

  const cyclePriority = useCallback(() => {
    const currentIdx = PRIORITY_OPTIONS.indexOf(priority);
    const next = PRIORITY_OPTIONS[(currentIdx + 1) % PRIORITY_OPTIONS.length];
    onPriorityChange(next);
  }, [priority, onPriorityChange]);

  // Default to the current follow-up day (no cap)
  const currentDay = typeof followUpDays === 'number' ? Math.max(followUpDays, 1) : 1;
  const [selectedDay, setSelectedDay] = useState(currentDay);

  // Load saved data for current day
  const savedDayData = data[selectedDay] || EMPTY_DAY;

  // Local draft state — initialized from saved data
  const [draft, setDraft] = useState({ ...EMPTY_DAY, ...savedDayData });

  // Check if draft differs from saved
  const isDirty = JSON.stringify(draft) !== JSON.stringify({ ...EMPTY_DAY, ...savedDayData });

  const handleDaySwitch = useCallback((day) => {
    setSelectedDay(day);
    const dayData = data[day] || EMPTY_DAY;
    setDraft({ ...EMPTY_DAY, ...dayData });
  }, [data]);

  const handleFieldChange = useCallback((field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave({ [selectedDay]: { ...draft } });
  }, [onSave, selectedDay, draft]);

  // Check which days have saved data
  const dayHasData = (day) => {
    const d = data[day];
    if (!d) return false;
    return d.arrivalStatus || d.actualTransport || d.delayed || d.reason || d.notes;
  };

  return (
    <div className={`fu-card fu-card-priority-${priority.toLowerCase()}`}>
      {/* Card Header — maid info */}
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
            <span>{fo.routeLabel || '—'}</span>
            <span className="fu-card-sub">{fo.timeWindow || '—'}</span>
          </div>
          <div className="fu-card-info-item">
            <span className="fu-card-label">DRIVER</span>
            <span>{fo.driverName || '—'}</span>
            <span className="fu-card-sub">{fo.driverPhone || ''}</span>
          </div>
          <div className="fu-card-info-item">
            <span className="fu-card-label">DAYS HIRED</span>
            <span className="days-hired-badge">{daysHired} days</span>
          </div>
          <div className="fu-card-info-item">
            <span className="fu-card-label">FOLLOW-UP DAYS</span>
            <span className="followup-days-badge">{followUpDays} {followUpDays === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="fu-card-info-item">
            <span className="fu-card-label">TO-DO LINK</span>
            <a
              href={`https://erp.maids.cc/post-sale-services/v2/open-todo/${fo.orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="todo-link"
            >
              Open
            </a>
          </div>
          <div className="fu-card-info-item">
            <span className="fu-card-label">PLANNED</span>
            <span className="fu-planned-value">{fo.plannedTransportation || 'Carlift'}</span>
          </div>
          <div className="fu-card-actions-top">
            <button
              className={`fu-priority-btn priority-${priority.toLowerCase()}`}
              onClick={cyclePriority}
              title="Click to cycle priority"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v7M6 1L3 4M6 1l3 3M2 11h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {priority}
            </button>
            <button className="move-back-btn" onClick={onMoveBack}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7 9.5L3.5 6 7 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Move Back
            </button>
            <button className="fu-complete-btn" onClick={onComplete}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Follow-Up Complete
            </button>
            {!order.cannotBeServed ? (
              <button className="cant-serve-btn" onClick={() => onUpdateOrder({ cannotBeServed: true })} title="Can't be served">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" transform="rotate(45 6 6)"/></svg>
                Can't serve
              </button>
            ) : (
              <button className="cant-serve-btn active" onClick={() => onUpdateOrder({ cannotBeServed: false })} title="Mark as servable">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Can serve
              </button>
            )}
            <button className="snooze-btn" onClick={() => setShowSnooze(true)} title="Snooze">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/><path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
              Snooze
            </button>
            {snoozedUntil && (
              <>
                <span className="snoozed-badge">
                  Snoozed until {new Date(snoozedUntil).toLocaleString()}
                </span>
                <button className="unsnooze-btn" onClick={() => onUpdateOrder({ snoozedUntil: null })} title="Unsnooze">
                  Unsnooze
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Day Fields */}
      <div className="fu-day-fields">
        <div className="fu-day-fields-grid">
          <div className="fu-field-group">
            <label className="fu-field-label">Follow-Up Day</label>
            <select
              className="fu-select fu-day-select"
              value={selectedDay}
              onChange={(e) => handleDaySwitch(Number(e.target.value))}
            >
              {Array.from({ length: currentDay }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>
                  Day {day}{day === currentDay ? ' (current)' : ''}{dayHasData(day) ? ' ●' : ''}
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

          <ReasonField reason={draft.reason} onChange={(val) => handleFieldChange('reason', val)} />

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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.667 4.083L5.25 10.5 2.333 7.583" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isDirty ? `Save Day ${selectedDay}` : 'Saved'}
          </button>
        </div>
      </div>

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onSave={(updates) => {
            onUpdateOrder(updates);
            setEditingOrder(null);
          }}
          onClose={() => setEditingOrder(null)}
        />
      )}

      {showSnooze && (
        <div className="modal-overlay" onClick={() => setShowSnooze(false)}>
          <SnoozePopover
            onSnooze={(until) => { onUpdateOrder({ snoozedUntil: until }); setShowSnooze(false); }}
            onClose={() => setShowSnooze(false)}
          />
        </div>
      )}
    </div>
  );
}
