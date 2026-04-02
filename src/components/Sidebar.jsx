import React, { useState, useEffect, useRef } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5"/>
    </svg>
  )},
  { id: 'transactions', label: 'Transactions', icon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M2 8h8M2 12h5"/>
    </svg>
  )},
  { id: 'insights',     label: 'Insights',     icon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12L5.5 8l3 3L14 4"/>
    </svg>
  )},
  { id: 'budgets',      label: 'Budgets',      icon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>
    </svg>
  )},
  { id: 'recurring',    label: 'Recurring',    icon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8a6 6 0 1 1 1.5 4M2 12V8h4"/>
    </svg>
  )},
  { id: 'ai-insights',  label: 'AI Advisor',   icon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2a5 5 0 0 1 0 10H5l-3 2V8a5 5 0 0 1 6-6z"/>
    </svg>
  )},
];

export default function Sidebar({ active, onNavigate, role, onRoleChange }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    const index = NAV_ITEMS.findIndex(item => item.id === active);
    setActiveIndex(index !== -1 ? index : 0);
  }, [active]);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('.nav-item-btn');
      if (items[activeIndex]) {
        const item = items[activeIndex];
        const indicatorHeight = 20;
        const offset = item.offsetTop + (item.offsetHeight - indicatorHeight) / 2;
        setYOffset(offset);
      }
    }
  }, [activeIndex]);

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoMark}>F</div>
        <div>
          <div style={styles.logoText}>FinFlow</div>
          <div style={styles.logoSub}>Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>Navigation</div>
        <div ref={listRef} style={{ position: 'relative' }}>
          {/* Sliding Active Indicator */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: 3,
              height: 20,
              borderRadius: 3,
              background: 'var(--accent)',
              transform: `translateY(${yOffset}px)`,
              transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 2,
            }}
          />
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(active === item.id ? styles.navItemActive : {}),
                animationDelay: `${0.06 + i * 0.06}s`,
              }}
              className="nav-item-btn"
              onClick={() => onNavigate(item.id)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Role */}
      <div style={styles.roleSection}>
        <div style={styles.roleLabel}>Role</div>
        <select
          value={role}
          onChange={e => onRoleChange(e.target.value)}
          style={styles.roleSelect}
        >
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
        <div style={{
          ...styles.roleBadge,
          ...(role === 'admin' ? styles.badgeAdmin : styles.badgeViewer),
          animation: 'floatBadge 4s ease-in-out infinite',
        }}>
          ● {role === 'admin' ? 'Admin Access' : 'View Only'}
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220, minWidth: 220,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh',
    overflowY: 'auto',
  },
  logo: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 10,
    animation: 'slideFromLeft 0.5s cubic-bezier(.4,0,.2,1) both',
  },
  logoMark: {
    width: 32, height: 32,
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 700, color: '#fff',
    animation: 'orbitSpin 12s linear infinite',
  },
  logoText: { fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' },
  logoSub:  { fontSize: 10, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase' },
  nav: { padding: '16px 12px', flex: 1 },
  navLabel: {
    fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
    color: 'var(--muted)', padding: '0 8px', marginBottom: 8,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 10px', borderRadius: 8,
    cursor: 'pointer', color: 'var(--muted)',
    fontSize: 13, fontWeight: 400,
    border: 'none', background: 'none',
    width: '100%', textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    position: 'relative', overflow: 'hidden',
    transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
    marginBottom: 2,
    animation: 'slideFromLeft 0.5s cubic-bezier(.4,0,.2,1) both',
  },
  navItemActive: {
    background: 'rgba(79,143,255,0.12)',
    color: 'var(--accent)',
    fontWeight: 500,
  },
  navIcon: { width: 16, height: 16, flexShrink: 0, opacity: 0.8 },

  roleSection: {
    padding: 16,
    borderTop: '1px solid var(--border)',
    animation: 'fadeUp 0.5s 0.4s both',
  },
  roleLabel: {
    fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
    color: 'var(--muted)', marginBottom: 8,
  },
  roleSelect: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    color: 'var(--text)',
    padding: '8px 10px',
    fontSize: 12,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer', outline: 'none',
  },
  roleBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    marginTop: 8, padding: '4px 10px',
    borderRadius: 20, fontSize: 11, fontWeight: 500,
  },
  badgeAdmin:  { background: 'rgba(124,92,252,0.2)', color: 'var(--accent2)' },
  badgeViewer: { background: 'rgba(79,143,255,0.15)', color: 'var(--accent)' },
};
