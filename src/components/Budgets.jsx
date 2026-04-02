import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, Btn, Modal, Field, Input, Select, EmptyState } from './UI';
import { CAT_COLORS, EXPENSE_CATS } from '../data/mockData';

function BudgetModal({ open, onClose, onSave, existingCats }) {
  const [cat, setCat]       = useState('Food');
  const [limit, setLimit]   = useState('');
  const [alertAt, setAlert] = useState('80');

  const available = EXPENSE_CATS.filter(c => !existingCats.includes(c));

  const handleSave = () => {
    if (!limit || parseFloat(limit) <= 0) return;
    onSave({ cat, limit: parseFloat(limit), alertAt: parseInt(alertAt) || 80 });
    setLimit(''); setAlert('80');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Budget Goal">
      <Field label="Category">
        <Select value={cat} onChange={e => setCat(e.target.value)}>
          {available.length ? available.map(c => <option key={c}>{c}</option>) : <option>All categories budgeted</option>}
        </Select>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Monthly Limit ($)">
          <Input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="500" min="1" />
        </Field>
        <Field label="Alert At (%)">
          <Input type="number" value={alertAt} onChange={e => setAlert(e.target.value)} placeholder="80" min="1" max="100" />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSave} disabled={!available.length}>Save Budget</Btn>
      </div>
    </Modal>
  );
}

export default function Budgets({ budgets, transactions, role, onAdd, onDelete, onToast }) {
  const [modalOpen, setModal] = useState(false);

  const getSpent = (cat) => transactions.filter(t => t.type === 'expense' && t.cat === cat).reduce((a, t) => a + t.amount, 0);

  const chartData = {
    labels: budgets.map(b => b.cat),
    datasets: [
      { label: 'Spent',  data: budgets.map(b => getSpent(b.cat)), backgroundColor: budgets.map(b => { const p = getSpent(b.cat)/b.limit; return p>1 ? 'rgba(240,106,106,0.75)' : p>=b.alertAt/100 ? 'rgba(245,167,66,0.75)' : 'rgba(45,212,160,0.75)'; }), borderRadius: 4, barPercentage: 0.6 },
      { label: 'Budget', data: budgets.map(b => b.limit), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, barPercentage: 0.6 },
    ],
  };

  return (
    <div>
      <BudgetModal
        open={modalOpen}
        onClose={() => setModal(false)}
        onSave={(b) => { onAdd(b); onToast('✅ Budget goal added'); }}
        existingCats={budgets.map(b => b.cat)}
      />

      {/* Budget Cards Grid */}
      {budgets.length === 0 ? (
        <Card hover={false} floatIndex={0} style={{ marginBottom: 24 }}>
          <EmptyState icon="🎯" title="No budget goals yet" sub={role === 'admin' ? 'Click "+ Add Budget" to set your first spending limit.' : 'No budgets have been configured.'} />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 24 }}>
          {budgets.map((b, i) => {
            const spent   = getSpent(b.cat);
            const pct     = Math.min((spent / b.limit) * 100, 100);
            const isOver  = spent > b.limit;
            const isWarn  = !isOver && pct >= b.alertAt;
            const fillColor   = isOver ? 'var(--red)' : isWarn ? 'var(--amber)' : 'var(--green)';
            const accentColor = isOver ? 'var(--red)' : isWarn ? 'var(--amber)' : CAT_COLORS[b.cat] || 'var(--accent)';
            const statusClass = isOver ? 'var(--red)' : isWarn ? 'var(--amber)' : 'var(--green)';
            return (
              <Card key={b.id} floatIndex={i} style={{ borderTop: `2px solid ${accentColor}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{b.cat}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Alert at {b.alertAt}% · Monthly</div>
                  </div>
                  {role === 'admin' && (
                    <Btn variant="sm" onClick={() => { onDelete(b.id); onToast('🗑️ Budget removed'); }}>Remove</Btn>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: accentColor }}>${spent.toFixed(0)}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>/ ${b.limit}</span>
                </div>
                <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{
                    height: '100%', borderRadius: 4, background: fillColor,
                    width: `${pct.toFixed(1)}%`,
                    animation: 'progressSweep 0.85s cubic-bezier(.4,0,.2,1) both',
                    transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
                  <span style={{ fontWeight: 600, color: statusClass }}>{pct.toFixed(1)}% used</span>
                  <span style={{ color: isOver ? 'var(--red)' : 'inherit' }}>
                    {isOver ? `$${Math.abs(b.limit - spent).toFixed(0)} over!` : `$${(b.limit - spent).toFixed(0)} left`}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Budget Button */}
      {role === 'admin' && (
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setModal(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--surface)', border: '1px dashed var(--border2)',
              borderRadius: 12, padding: 28, color: 'var(--muted)', fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s', width: '100%',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.transform = ''; }}
          >
            + Add Budget Goal
          </button>
        </div>
      )}

      {/* Performance Chart */}
      {budgets.length > 0 && (
        <Card hover={false} floatIndex={5}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>Budget Performance</div>
          <div style={{ height: 220 }}>
            <Bar data={chartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a2035', titleColor: '#e8eaf2', bodyColor: '#7b82a0', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#7b82a0', font: { size: 11 } } },
                y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7b82a0', font: { size: 11 }, callback: v => '$' + v } },
              },
            }} />
          </div>
        </Card>
      )}
    </div>
  );
}
