export default function StatsCards({ stats }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Orders</span>
          <div className="stat-icon-circle blue">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6 1.5v3M12 1.5v3M2.25 7.5h13.5M3.75 3h10.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V4.5a1.5 1.5 0 011.5-1.5z" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="stat-value">{stats.total.toLocaleString()}</div>
        <div className="stat-change positive">
          <svg className="change-wave" width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 8c1.5-3 3-5 4.5-2s3 3 4.5 0 3-5 5-3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          +12.5%&nbsp;&nbsp;vs last week
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Pending</span>
          <div className="stat-icon-circle orange">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="#F59E0B" strokeWidth="1.3"/>
              <path d="M9 4.5V9l3 1.5" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="stat-value">{stats.pending.toLocaleString()}</div>
        <div className="stat-change negative">
          <svg className="change-wave" width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 2c1.5 3 3 5 4.5 2s3-3 4.5 0 3 5 5 3" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          -2.1%&nbsp;&nbsp;vs last week
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Waiting Driver</span>
          <div className="stat-icon-circle red">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L1.5 15h15L9 1.5z" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 6.75v3M9 12.75h.008" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="stat-value">{stats.waiting.toLocaleString()}</div>
        <div className="stat-change positive">
          <svg className="change-wave" width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 8c1.5-3 3-5 4.5-2s3 3 4.5 0 3-5 5-3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          +5.3%&nbsp;&nbsp;vs last week
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Confirmed</span>
          <div className="stat-icon-circle green">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15.75 8.31V9a6.75 6.75 0 11-4.003-6.169" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.75 3L9 9.758l-2.025-2.025" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="stat-value">{stats.confirmed.toLocaleString()}</div>
        <div className="stat-change positive">
          <svg className="change-wave" width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 8c1.5-3 3-5 4.5-2s3 3 4.5 0 3-5 5-3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          +8.4%&nbsp;&nbsp;vs last week
        </div>
      </div>
    </div>
  );
}
