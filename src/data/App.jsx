import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Insights from './components/Insights';
import Budgets from './components/Budgets';
import Recurring from './components/Recurring';
import AIInsights from './components/AIInsights';
import { Toast } from './components/UI';
import { useTransactions, useBudgets, useRecurring } from './hooks';

const PAGE_META = {
  dashboard:    { title: 'Dashboard',    sub: 'April 2026 · Financial overview' },
  transactions: { title: 'Transactions', sub: 'Manage your transactions' },
  insights:     { title: 'Insights',     sub: 'Spending analysis & patterns' },
  budgets:      { title: 'Budget Goals', sub: 'Track your monthly spending limits' },
  recurring:    { title: 'Recurring',    sub: 'Manage subscriptions & recurring payments' },
  'ai-insights':{ title: 'AI Advisor',   sub: 'Chat with your AI financial advisor' },
};

export default function App() {
  const [page, setPage]       = useState('dashboard');
  const [role, setRole]       = useState('admin');
  const [toast, setToast]     = useState({ msg: '', visible: false });
  const [toastTimer, setTimer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    showToast(r === 'admin' ? '🔓 Switched to Admin mode' : '🔒 Switched to Viewer mode');
  };

  const exportCSV = () => {
    const headers = ['Date','Description','Category','Type','Amount'];
    const rows    = transactions.map(t => [t.date, t.desc, t.cat, t.type, t.amount]);
    const csv     = [headers, ...rows].map(r => r.join(',')).join('\n');
    const url     = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a       = document.createElement('a');
    a.href = url; a.download = 'finflow-transactions.csv'; a.click();
    showToast('📁 CSV exported');
  };

  const meta = PAGE_META[page];

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
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
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
            >↓ Export</button>
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
                >+ Add Transaction</button>
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
        <div className="content-area" style={{ flex: 1, overflowY: 'auto', padding: 28, scrollBehavior: 'smooth' }}>
          <div key={page} style={{ animation: 'pageTransition 0.22s ease both' }}>
            {page === 'dashboard'    && <Dashboard   transactions={transactions} />}
            {page === 'transactions' && <Transactions transactions={transactions} role={role} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} onToast={showToast} />}
            {page === 'insights'     && <Insights    transactions={transactions} />}
            {page === 'budgets'      && <Budgets     budgets={budgets} transactions={transactions} role={role} onAdd={addBudget} onDelete={deleteBudget} onToast={showToast} />}
            {page === 'recurring'    && <Recurring   recurring={recurring} role={role} onAdd={addRecurring} onToggle={toggleRecurring} onDelete={deleteRecurring} onToast={showToast} />}
            {page === 'ai-insights'  && <AIInsights  transactions={transactions} budgets={budgets} />}
          </div>
        </div>
      </div>

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
