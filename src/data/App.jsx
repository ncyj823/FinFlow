import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import Transactions from '../components/Transactions';
import Insights from '../components/Insights';
import Budgets from '../components/Budgets';
import Recurring from '../components/Recurring';
import AIInsights from '../components/AIInsights';
import { Toast } from '../components/UI';
import { useTransactions, useBudgets, useRecurring } from '../hooks';
import { useLang } from '../context/LangContext';

export default function App() {
  const { t } = useLang();
  const [page, setPage]       = useState('dashboard');
  const [role, setRole]       = useState('admin');
  const [toast, setToast]     = useState({ msg: '', visible: false });
  const [toastTimer, setTimer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { budgets, addBudget, deleteBudget }                                   = useBudgets();
  const { recurring, addRecurring, toggleRecurring, deleteRecurring }          = useRecurring();

  const showToast = useCallback((msg) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast({ msg, visible: true });
    const t = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
    setTimer(t);
  }, [toastTimer]);

  const handleRoleChange = (r) => {
    setRole(r);
    showToast(r === 'admin' ? `🔓 ${t('toasts.roleAdmin')}` : `🔒 ${t('toasts.roleViewer')}`);
  };

  const exportCSV = () => {
    const headers = ['Date','Description','Category','Type','Amount'];
    const rows    = transactions.map(t => [t.date, t.desc, t.cat, t.type, t.amount]);
    const csv     = [headers, ...rows].map(r => r.join(',')).join('\n');
    const url     = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a       = document.createElement('a');
    a.href = url; a.download = 'finflow-transactions.csv'; a.click();
    showToast(`📁 ${t('toasts.csvExport')}`);
  };

  const pageKeyMap = {
    dashboard: 'dashboard',
    transactions: 'transactions',
    insights: 'insights',
    budgets: 'budgets',
    recurring: 'recurring',
    'ai-insights': 'aiInsights',
  };
  const pageKey = pageKeyMap[page] || 'dashboard';
  const meta = {
    title: t(`topbar.pages.${pageKey}.title`),
    sub: t(`topbar.pages.${pageKey}.sub`),
  };

  useEffect(() => {
    setFabOpen(false);
  }, [page]);

  const fabActions = [
    { id: 'tx', label: t('topbar.addTransaction'), onClick: () => setPage('transactions'), angle: -120 },
    { id: 'budget', label: t('budgets.addButton'), onClick: () => setPage('budgets'), angle: -90 },
    { id: 'rec', label: t('recurring.addButton'), onClick: () => setPage('recurring'), angle: -60 },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Dark Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 39,
            animation: 'overlayIn 0.2s ease-out',
          }}
        />
      )}

      <Sidebar active={page} onNavigate={(id) => { setPage(id); setSidebarOpen(false); }} role={role} onRoleChange={handleRoleChange} sidebarOpen={sidebarOpen} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div className="topbar" style={{
          background: 'linear-gradient(180deg, rgba(15, 21, 37, 0.86), rgba(15, 21, 37, 0.62))', borderBottom: '1px solid rgba(171, 194, 255, 0.18)',
          backdropFilter: 'blur(10px) saturate(120%)',
          padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
          animation: 'fadeUp 0.4s cubic-bezier(.4,0,.2,1) both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hamburger-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontSize: 20,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              ☰
            </button>
            <div>
              <div className="topbar-title" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.4px' }}>{meta.title}</div>
              <div className="topbar-subtitle" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{meta.sub}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={exportCSV}
              className="export-btn-text"
              style={btnStyle}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >↓ {t('topbar.export')}</button>
            <button
              onClick={exportCSV}
              className="export-btn-icon"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontSize: 16,
                cursor: 'pointer',
                padding: 6,
              }}
            >
              ↓
            </button>
            {role === 'admin' && (
              <>
                <button
                  onClick={() => setPage('transactions')}
                  className="add-tx-btn-text"
                  style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', border: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#6fa3ff'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,143,255,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >+ {t('topbar.addTransaction')}</button>
                <button
                  onClick={() => setPage('transactions')}
                  className="add-tx-btn-icon"
                  style={{
                    display: 'none',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    width: 36,
                    height: 36,
                    fontSize: 18,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#6fa3ff'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,143,255,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >+</button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="content-area" style={{ flex: 1, overflowY: 'auto', padding: 28, scrollBehavior: 'smooth', background: 'transparent' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {page === 'dashboard'    && <Dashboard   transactions={transactions} />}
              {page === 'transactions' && <Transactions transactions={transactions} role={role} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} onToast={showToast} />}
              {page === 'insights'     && <Insights    transactions={transactions} />}
              {page === 'budgets'      && <Budgets     budgets={budgets} transactions={transactions} role={role} onAdd={addBudget} onDelete={deleteBudget} onToast={showToast} />}
              {page === 'recurring'    && <Recurring   recurring={recurring} role={role} onAdd={addRecurring} onToggle={toggleRecurring} onDelete={deleteRecurring} onToast={showToast} />}
              {page === 'ai-insights'  && <AIInsights  transactions={transactions} budgets={budgets} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {role === 'admin' && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 120 }}>
          <AnimatePresence>
            {fabOpen && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.08, delayChildren: 0.02 } },
                  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
                }}
                style={{ position: 'absolute', right: 0, bottom: 0, width: 220, height: 220, pointerEvents: 'none' }}
              >
                {fabActions.map((action) => {
                  const r = 92;
                  const x = Math.cos((action.angle * Math.PI) / 180) * r;
                  const y = Math.sin((action.angle * Math.PI) / 180) * r;
                  return (
                    <motion.button
                      key={action.id}
                      variants={{
                        open: { opacity: 1, scale: 1, x, y },
                        closed: { opacity: 0, scale: 0.6, x: 0, y: 0 },
                      }}
                      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                      onClick={() => {
                        setFabOpen(false);
                        action.onClick();
                      }}
                      style={{
                        position: 'absolute',
                        right: 10,
                        bottom: 10,
                        pointerEvents: 'auto',
                        border: '1px solid rgba(171, 194, 255, 0.24)',
                        background: 'linear-gradient(180deg, rgba(22,29,48,0.9), rgba(15,21,37,0.92))',
                        color: 'var(--text)',
                        borderRadius: 999,
                        padding: '8px 12px',
                        fontSize: 11,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 14px 28px rgba(3, 6, 15, 0.45)',
                      }}
                    >
                      {action.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setFabOpen(v => !v)}
            animate={{ rotate: fabOpen ? 45 : 0, scale: fabOpen ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              color: '#fff',
              fontSize: 30,
              lineHeight: 1,
              cursor: 'pointer',
              boxShadow: '0 18px 40px rgba(35, 78, 180, 0.45)',
            }}
            aria-label="Quick actions"
          >
            +
          </motion.button>
        </div>
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}

const btnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 8,
  fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500,
  cursor: 'pointer', transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
  background: 'rgba(255,255,255,0.05)', color: 'var(--muted)',
  border: '1px solid var(--border2)',
};
