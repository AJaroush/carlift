import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">C</span>
          <span className="logo-text">CARLIFT<span className="logo-accent">OPS</span></span>
        </div>
        <nav className="nav">
          <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Orders
          </NavLink>
          <NavLink to="/carlifts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Carlifts
          </NavLink>
        </nav>
      </div>
      <div className="header-right">
        <button className="notification-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 6.667a5 5 0 10-10 0c0 5.833-2.5 7.5-2.5 7.5h15S15 12.5 15 6.667z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.442 17.5a1.667 1.667 0 01-2.884 0" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="user-menu">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">Dispatch Manager</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    </header>
  );
}
