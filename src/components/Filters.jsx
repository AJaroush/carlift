const STATUS_OPTIONS = ['Pending', 'Waiting Driver', 'Confirmed'];

export default function Filters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateRange,
  onDateRangeChange,
}) {
  const toggleStatus = (status) => {
    if (statusFilter.includes(status)) {
      onStatusChange(statusFilter.filter((s) => s !== status));
    } else {
      onStatusChange([...statusFilter, status]);
    }
  };

  return (
    <div className="filters-bar">
      <div className="search-box">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M8.25 14.25a6 6 0 100-12 6 6 0 000 12zM15.75 15.75l-3.263-3.263" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search client, driver, or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="date-filters">
        <div className="date-input-wrapper">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
          />
        </div>
        <span className="date-separator">-</span>
        <div className="date-input-wrapper">
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      <div className="status-filters">
        <span className="filter-label">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14.667 2H1.333l5.334 6.307v4.36L9.333 14V8.307L14.667 2z" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          STATUS:
        </span>
        {STATUS_OPTIONS.map((status) => {
          const isActive = statusFilter.includes(status);
          const colorClass = status === 'Pending' ? 'pending' : status === 'Waiting Driver' ? 'waiting' : 'confirmed';
          return (
            <button
              key={status}
              className={`status-chip ${colorClass} ${isActive ? 'active' : ''}`}
              onClick={() => toggleStatus(status)}
            >
              {status}
            </button>
          );
        })}
      </div>
    </div>
  );
}
