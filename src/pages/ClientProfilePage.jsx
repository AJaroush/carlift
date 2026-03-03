import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STATIC_MAIDS = {
  'Sarah Al Maktoum': {
    current: [
      {
        name: 'Maria Santos',
        nationality: 'Filipino',
        age: 32,
        phone: '+971 50 111 1111',
        startDate: '2026-02-15',
        contractType: 'Monthly',
        status: 'Active',
        pickupArea: 'Satwa',
        dropoffArea: 'JLT',
        rating: 4.8,
      },
    ],
    previous: [
      {
        name: 'Anita Rai',
        nationality: 'Nepali',
        age: 28,
        phone: '+971 50 900 0001',
        startDate: '2025-06-01',
        endDate: '2026-01-30',
        contractType: 'Monthly',
        status: 'Completed',
        pickupArea: 'Deira',
        dropoffArea: 'JLT',
        rating: 4.2,
        endReason: 'Contract ended',
      },
      {
        name: 'Lina Perez',
        nationality: 'Filipino',
        age: 35,
        phone: '+971 50 900 0002',
        startDate: '2024-12-01',
        endDate: '2025-05-15',
        contractType: 'Monthly',
        status: 'Terminated',
        pickupArea: 'International City',
        dropoffArea: 'JLT',
        rating: 3.5,
        endReason: 'Client request',
      },
    ],
  },
  'Ahmed Bin Rashid': {
    current: [
      {
        name: 'Priya Sharma',
        nationality: 'Indian',
        age: 29,
        phone: '+971 50 222 2222',
        startDate: '2026-01-10',
        contractType: 'Monthly',
        status: 'Active',
        pickupArea: 'Satwa',
        dropoffArea: 'JLT',
        rating: 4.5,
      },
    ],
    previous: [
      {
        name: 'Dewi Putri',
        nationality: 'Indonesian',
        age: 31,
        phone: '+971 50 900 0003',
        startDate: '2025-03-01',
        endDate: '2025-12-20',
        contractType: 'Monthly',
        status: 'Completed',
        pickupArea: 'Sharjah',
        dropoffArea: 'JLT',
        rating: 4.0,
        endReason: 'Maid returned home',
      },
    ],
  },
  'Fatima Hassan': {
    current: [
      {
        name: 'Lina Reyes',
        nationality: 'Filipino',
        age: 27,
        phone: '+971 50 333 3333',
        startDate: '2026-02-28',
        contractType: 'Monthly',
        status: 'Active',
        pickupArea: 'Satwa',
        dropoffArea: 'JLT',
        rating: 4.9,
      },
    ],
    previous: [],
  },
  'Hessa Al Falasi': {
    current: [
      {
        name: 'Grace Dela Cruz',
        nationality: 'Filipino',
        age: 34,
        phone: '+971 50 999 9999',
        startDate: '2026-02-27',
        contractType: 'Monthly',
        status: 'Active',
        pickupArea: 'JBR',
        dropoffArea: 'Palm Jumeirah',
        rating: 4.7,
      },
    ],
    previous: [
      {
        name: 'Rosa Alvarez',
        nationality: 'Filipino',
        age: 30,
        phone: '+971 50 900 0004',
        startDate: '2025-01-15',
        endDate: '2026-02-10',
        contractType: 'Monthly',
        status: 'Completed',
        pickupArea: 'Satwa',
        dropoffArea: 'Palm Jumeirah',
        rating: 4.6,
        endReason: 'Contract ended',
      },
      {
        name: 'Siti Aminah',
        nationality: 'Indonesian',
        age: 26,
        phone: '+971 50 900 0005',
        startDate: '2024-06-01',
        endDate: '2024-12-31',
        contractType: 'Monthly',
        status: 'Terminated',
        pickupArea: 'Deira',
        dropoffArea: 'Palm Jumeirah',
        rating: 3.2,
        endReason: 'Performance issues',
      },
    ],
  },
};

function getDefaultMaids(order) {
  return {
    current: [{
      name: order.housemaidName || '—',
      nationality: 'N/A',
      age: '—',
      phone: order.housemaidPhone || '—',
      startDate: order.transferDate?.split(' ')[0] || '—',
      contractType: 'Monthly',
      status: order.housemaidStatus === 'WITH_CLIENT' ? 'Active' : 'Pending',
      pickupArea: order.pickupArea || '—',
      dropoffArea: order.dropoffArea || '—',
      rating: '—',
    }],
    previous: [],
  };
}

function StarRating({ rating }) {
  if (rating === '—') return <span className="cp-rating-na">N/A</span>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="cp-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill={i < full ? '#F59E0B' : i === full && half ? 'url(#half)' : '#E2E8F0'}>
          <defs><linearGradient id="half"><stop offset="50%" stopColor="#F59E0B"/><stop offset="50%" stopColor="#E2E8F0"/></linearGradient></defs>
          <path d="M7 1l1.76 3.57 3.94.57-2.85 2.78.67 3.93L7 10.27 3.48 11.85l.67-3.93L1.3 5.14l3.94-.57L7 1z"/>
        </svg>
      ))}
      <span className="cp-rating-number">{rating}</span>
    </span>
  );
}

export default function ClientProfilePage() {
  const { clientName } = useParams();
  const { orders } = useApp();
  const decodedName = decodeURIComponent(clientName);

  const clientOrders = orders.filter(o => o.clientName === decodedName);
  const order = clientOrders[0];

  if (!order) {
    return (
      <div className="cp-page">
        <Link to="/waiting-list" className="cp-back-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Waiting List
        </Link>
        <div className="cp-not-found">Client not found.</div>
      </div>
    );
  }

  const maidsData = STATIC_MAIDS[decodedName] || getDefaultMaids(order);

  return (
    <div className="cp-page">
      <Link to="/waiting-list" className="cp-back-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Waiting List
      </Link>

      <div className="cp-header-card">
        <div className="cp-avatar">{decodedName.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
        <div className="cp-header-info">
          <h1 className="cp-client-name">{decodedName}</h1>
          <div className="cp-header-meta">
            <span className="cp-meta-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12.25S1.75 9 1.75 5.25a5.25 5.25 0 1110.5 0C12.25 9 7 12.25 7 12.25z" stroke="#94A3B8" strokeWidth="1.2"/><circle cx="7" cy="5.25" r="1.75" stroke="#94A3B8" strokeWidth="1.2"/></svg>
              {order.clientLocation || order.clientArea || '—'}
            </span>
            <span className="cp-meta-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.75" y="2.333" width="10.5" height="9.917" rx="1.5" stroke="#94A3B8" strokeWidth="1.2"/><path d="M1.75 5.833h10.5M4.667 1.167v2.333M9.333 1.167v2.333" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Client since {order.creationDate?.split(' ')[0] || '—'}
            </span>
            <span className="cp-meta-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12.833A5.833 5.833 0 107 1.167a5.833 5.833 0 000 11.666z" stroke="#94A3B8" strokeWidth="1.2"/><path d="M7 3.5V7l2.333 1.167" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round"/></svg>
              {clientOrders.length} active order{clientOrders.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="cp-section">
        <div className="cp-section-header">
          <h2>Current Maids</h2>
          <span className="cp-count-badge">{maidsData.current.length}</span>
        </div>
        {maidsData.current.length === 0 ? (
          <div className="cp-empty">No current maids assigned.</div>
        ) : (
          <div className="cp-maid-cards">
            {maidsData.current.map((maid, i) => (
              <MaidCard key={i} maid={maid} isCurrent />
            ))}
          </div>
        )}
      </div>

      <div className="cp-section">
        <div className="cp-section-header">
          <h2>Previous Maids</h2>
          <span className="cp-count-badge">{maidsData.previous.length}</span>
        </div>
        {maidsData.previous.length === 0 ? (
          <div className="cp-empty">No previous maids on record.</div>
        ) : (
          <div className="cp-maid-cards">
            {maidsData.previous.map((maid, i) => (
              <MaidCard key={i} maid={maid} isCurrent={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MaidCard({ maid, isCurrent }) {
  const statusClass = maid.status === 'Active' ? 'active' :
    maid.status === 'Completed' ? 'completed' : 'terminated';

  return (
    <div className={`cp-maid-card ${isCurrent ? 'current' : 'previous'}`}>
      <div className="cp-maid-card-top">
        <div className="cp-maid-avatar">{maid.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
        <div className="cp-maid-info">
          <div className="cp-maid-name">{maid.name}</div>
          <div className="cp-maid-subtitle">{maid.nationality} &middot; Age {maid.age}</div>
        </div>
        <span className={`cp-maid-status ${statusClass}`}>{maid.status}</span>
      </div>

      <div className="cp-maid-details">
        <div className="cp-detail-row">
          <span className="cp-detail-label">Phone</span>
          <span className="cp-detail-value">{maid.phone}</span>
        </div>
        <div className="cp-detail-row">
          <span className="cp-detail-label">Contract</span>
          <span className="cp-detail-value">{maid.contractType}</span>
        </div>
        <div className="cp-detail-row">
          <span className="cp-detail-label">Start Date</span>
          <span className="cp-detail-value">{maid.startDate}</span>
        </div>
        {!isCurrent && maid.endDate && (
          <div className="cp-detail-row">
            <span className="cp-detail-label">End Date</span>
            <span className="cp-detail-value">{maid.endDate}</span>
          </div>
        )}
        <div className="cp-detail-row">
          <span className="cp-detail-label">Route</span>
          <span className="cp-detail-value">{maid.pickupArea} → {maid.dropoffArea}</span>
        </div>
        <div className="cp-detail-row">
          <span className="cp-detail-label">Rating</span>
          <span className="cp-detail-value"><StarRating rating={maid.rating} /></span>
        </div>
        {!isCurrent && maid.endReason && (
          <div className="cp-detail-row">
            <span className="cp-detail-label">Reason</span>
            <span className="cp-detail-value cp-reason">{maid.endReason}</span>
          </div>
        )}
      </div>
    </div>
  );
}
