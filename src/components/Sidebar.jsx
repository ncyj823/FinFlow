import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';

const NAV_ITEMS = [
  { id: 'dashboard',    icon: '◈', key: 'dashboard' },
  { id: 'transactions', icon: '⇄', key: 'transactions' },
  { id: 'insights',     icon: '◎', key: 'insights' },
  { id: 'budgets',      icon: '▦', key: 'budgets' },
  { id: 'recurring',    icon: '↺', key: 'recurring' },
  { id: 'ai-insights',  icon: '✦', key: 'aiInsights' },
];

export default function Sidebar({ active, onNavigate, role, onRoleChange, sidebarOpen }) {
  const { language, setLanguage, t } = useLang();
  const [activeIndex, setActiveIndex] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const [roleBadgeKey, setRoleBadgeKey] = useState(0);
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

  const handleRoleChange = (val) => {
    onRoleChange(val);
    setRoleBadgeKey(k => k + 1);
  };

  return (
    <aside style={styles.sidebar} className={`finflow-sidebar ${sidebarOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoMark}>F</div>
        <div>
          <div style={styles.logoText}>{t('sidebar.appName')}</div>
          <div style={styles.logoSub}>{t('sidebar.appSub')}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>{t('sidebar.menu')}</div>
        <div ref={listRef} style={{ position: 'relative' }}>
          {/* Sliding Active Indicator */}
          <motion.div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              height: 36,
              borderRadius: 8,
              background: 'rgba(79,143,255,0.12)',
              border: '1px solid rgba(139, 171, 255, 0.24)',
              backdropFilter: 'blur(8px)',
              zIndex: 0,
            }}
            animate={{ y: yOffset - 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(active === item.id ? styles.navItemActive : {}),
                animationDelay: `${0.1 + i * 0.055}s`,
              }}
              className="nav-item-btn"
              onClick={() => onNavigate(item.id)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(3px)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.color = active === item.id ? 'var(--accent)' : 'var(--muted)';
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {t(`sidebar.nav.${item.key}`)}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer Controls */}
      <div style={{...styles.roleSection}}>
        <div style={styles.roleLabel}>{t('sidebar.role')}</div>
        <select
          value={role}
          onChange={e => handleRoleChange(e.target.value)}
          style={styles.roleSelect}
        >
          <option value="admin">{t('sidebar.admin')}</option>
          <option value="viewer">{t('sidebar.viewer')}</option>
        </select>
        <div
          key={roleBadgeKey}
          style={{
            ...styles.roleBadge,
            ...(role === 'admin' ? styles.badgeAdmin : styles.badgeViewer),
            animation: 'roleBadgeAnim 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          ● {role === 'admin' ? t('sidebar.adminAccess') : t('sidebar.viewOnly')}
        </div>

        <div style={{ ...styles.roleLabel, marginTop: 14 }}>{t('sidebar.language')}</div>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={styles.roleSelect}
        >
          <option value="en">{t('sidebar.languageNames.en')}</option>
          <option value="hi">{t('sidebar.languageNames.hi')}</option>
          <option value="te">{t('sidebar.languageNames.te')}</option>
        </select>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220, minWidth: 220,
    background: 'linear-gradient(185deg, rgba(15, 21, 37, 0.68), rgba(15, 21, 37, 0.5))',
    backdropFilter: 'blur(12px) saturate(130%)',
    borderRight: '1px solid rgba(171, 194, 255, 0.18)',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh',
    overflowY: 'auto',
    animation: 'sidebarSlide 0.45s cubic-bezier(0.4, 0, 0.2, 1) both',
  },
  logo: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(171, 194, 255, 0.16)',
    display: 'flex', alignItems: 'center', gap: 10,
    animation: 'logoFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.15s both',
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
  nav: { padding: '16px 12px', flex: 1, position: 'relative' },
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
    position: 'relative', zIndex: 1, overflow: 'hidden',
    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: 2,
    animation: 'navItemSlide 0.35s cubic-bezier(0.4, 0, 0.2, 1) both',
  },
  navItemActive: {
    background: 'rgba(79,143,255,0.15)',
    color: 'var(--accent)',
    fontWeight: 500,
  },
  navIcon: { width: 16, height: 16, flexShrink: 0, opacity: 0.8 },

  roleSection: {
    padding: 16,
    borderTop: '1px solid rgba(171, 194, 255, 0.16)',
    animation: 'roleSectionFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both',
  },
  roleLabel: {
    fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
    color: 'var(--muted)', marginBottom: 8,
  },
  roleSelect: {
    width: '100%',
    background: 'rgba(22, 29, 48, 0.5)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: 'var(--text)',
    padding: '8px 10px',
    fontSize: 12,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s',
  },
  roleBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    marginTop: 8, padding: '4px 10px',
    borderRadius: 20, fontSize: 11, fontWeight: 500,
  },
  badgeAdmin:  { background: 'rgba(124,92,252,0.2)', color: 'var(--accent2)' },
  badgeViewer: { background: 'rgba(79,143,255,0.15)', color: 'var(--accent)' },
};
