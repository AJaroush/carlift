import { mapStatus } from '../App';

export default function OrdersTable({ orders, loading, error }) {
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading-state">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-container">
        <div className="error-state">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="orders-table">
        <thead>
          <tr>
            <th>CLIENT / MAID</th>
            <th>LOCATIONS</th>
            <th>DATE &amp; TIME</th>
            <th>DAYS W/ CARLIFT</th>
            <th>TIMINGS</th>
            <th>STATUS</th>
            <th>DRIVER INFO</th>
            <th>PRICE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="9" className="empty-state">No orders found</td>
            </tr>
          ) : (
            orders.map((order) => (
              <OrderRow key={order.id || order.contractId} order={order} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function OrderRow({ order }) {
  const status = mapStatus(order.housemaidStatus);
  const statusClass = status === 'Confirmed' ? 'confirmed' : status === 'Pending' ? 'pending' : 'waiting';

  const dateStr = order.creationDate?.split(' ')[0] || '—';
  const timeStr = order.creationDate?.split(' ')[1]?.slice(0, 5) || '—';

  const transferDate = order.transferDate ? new Date(order.transferDate.replace(' ', 'T')) : null;
  const now = new Date();
  const daysDiff = transferDate ? Math.max(0, Math.ceil((now - transferDate) / (1000 * 60 * 60 * 24))) : 0;

  const pickTime = timeStr !== '—' ? formatTimeTo12h(timeStr) : '—';
  const retHour = timeStr !== '—' ? addHours(timeStr, 4) : '—';

  const initial = order.assignee ? order.assignee.charAt(0).toUpperCase() : null;

  const contractLabel = order.typeOfTheContractLabel || '—';

  return (
    <tr>
      <td>
        <div className="client-cell">
          <div className="client-name">{order.clientName || '—'}</div>
          <div className="maid-name">
            <span className="maid-dot"></span>
            {order.housemaidName || '—'}
          </div>
        </div>
      </td>
      <td>
        <div className="location-cell">
          <div className="loc-row"><span className="loc-label">P:</span> {contractLabel}</div>
          <div className="loc-row"><span className="loc-label">D:</span> —</div>
        </div>
      </td>
      <td>
        <div className="datetime-cell">
          <div className="date-main">{dateStr}</div>
          <div className="time-sub">{timeStr} AM</div>
        </div>
      </td>
      <td>
        <div className="days-badge">{daysDiff} days</div>
      </td>
      <td>
        <div className="timings-cell">
          <div className="timing-row">
            <span className="timing-label pick">PICK</span>
            <div className="timing-select-wrapper">
              <select className="timing-select" defaultValue={pickTime}>
                <option>{pickTime}</option>
              </select>
            </div>
          </div>
          <div className="timing-row">
            <span className="timing-label ret">RET</span>
            <div className="timing-select-wrapper">
              <select className="timing-select" defaultValue={retHour}>
                <option>{retHour}</option>
              </select>
            </div>
          </div>
        </div>
      </td>
      <td>
        <span className={`status-badge ${statusClass}`}>{status}</span>
      </td>
      <td>
        {order.assignee ? (
          <div className="driver-info">
            <span className="driver-avatar">{initial}</span>
            <span className="driver-name">{order.assignee}</span>
          </div>
        ) : (
          <button className="assign-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M2 12.5c0-2.5 2.239-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M11 2.5v4M9 4.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Assign
          </button>
        )}
      </td>
      <td>
        <div className="price-box">AED —</div>
      </td>
      <td>
        <div className="actions-cell">
          <button className="action-btn" title="View">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.545-5 7-5 7 5 7 5-2.545 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>
          <button className="action-btn" title="Edit">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.333 2a1.886 1.886 0 012.667 2.667L5.333 13.333 2 14l.667-3.333L11.333 2z" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>
          <button className="action-btn" title="Message">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 10.333a1.333 1.333 0 01-1.333 1.334H4.333L2 14V3.333A1.333 1.333 0 013.333 2h9.334A1.333 1.333 0 0114 3.333v7z" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>
          <button className="action-btn delete" title="Delete">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

function formatTimeTo12h(time24) {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

function addHours(time24, hours) {
  const [h, m] = time24.split(':').map(Number);
  const newH = (h + hours) % 24;
  const period = newH >= 12 ? 'PM' : 'AM';
  const h12 = newH % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}
