import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Card } from './UI';
import { CAT_COLORS } from '../data/mockData';

export default function Insights({ transactions }) {
  const expenses    = transactions.filter(t => t.type === 'expense');
  const income      = transactions.filter(t => t.type === 'income');
  const totalExp    = expenses.reduce((a, t) => a + t.amount, 0);
  const totalInc    = income.reduce((a, t) => a + t.amount, 0);
  const savings     = totalInc - totalExp;
  const savingsRate = ((savings / totalInc) * 100).toFixed(1);
  const avgExp      = (totalExp / expenses.length).toFixed(0);

  const cats = {};
  expenses.forEach(t => { cats[t.cat] = (cats[t.cat] || 0) + t.amount; });
  const topCat    = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const maxCat    = sortedCats[0]?.[1] || 1;

  const monthlyData = {
    labels: ['Nov','Dec','Jan','Feb','Mar','Apr'],
    datasets: [
      { label: 'Income',   data: [5200,5800,6400,7100,7520,8450], backgroundColor: 'rgba(45,212,160,0.7)',  borderRadius: 4, barPercentage: 0.6 },
      { label: 'Expenses', data: [3800,4100,4200,4000,3640,3820], backgroundColor: 'rgba(240,106,106,0.7)', borderRadius: 4, barPercentage: 0.6 },
    ],
  };

  const insightCards = [
    { icon: '🏆', label: 'Top Spending Category', value: topCat?.[0], desc: `$${topCat?.[1].toFixed(0)} total · ${((topCat?.[1]/totalExp)*100).toFixed(0)}% of expenses`, color: 'var(--red)',   accent: 'var(--red)' },
    { icon: '💰', label: 'Monthly Savings',       value: `$${savings.toFixed(0)}`,  desc: `${savingsRate}% savings rate this month`,           color: 'var(--green)', accent: 'var(--green)' },
    { icon: '📊', label: 'Avg Transaction',       value: `$${avgExp}`,              desc: `Across ${expenses.length} expense entries`,         color: 'var(--accent)',accent: 'var(--accent)' },
  ];

  return (
    <div>
      {/* Insight KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {insightCards.map((c, i) => (
          <Card key={c.label} floatIndex={i} style={{ borderTop: `2px solid ${c.accent}` }}>
            <div style={{ fontSize: 22, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-mono)', color: c.color, animation: 'countUp 0.5s 0.2s both' }}>{c.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>{c.desc}</div>
          </Card>
        ))}
      </div>

      {/* Monthly Bar Chart */}
      <Card floatIndex={3} hover={false} style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Monthly Income vs Expenses</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>6-month comparison</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {[['#2dd4a0','Income'],['#f06a6a','Expenses']].map(([c,l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
            </div>
          ))}
        </div>
        <div style={{ height: 240 }}>
          <Bar data={monthlyData} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a2035', titleColor: '#e8eaf2', bodyColor: '#7b82a0', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 } },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#7b82a0', font: { size: 11 } } },
              y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7b82a0', font: { size: 11 }, callback: v => '$' + (v/1000).toFixed(0) + 'k' } },
            },
          }} />
        </div>
      </Card>

      {/* Spending Distribution */}
      <Card floatIndex={4} hover={false}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>Spending Distribution</div>
        {sortedCats.map(([cat, amt], i) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, animation: `fadeUp 0.35s ${i * 0.06}s both` }}>
            <div style={{ fontSize: 12, color: 'var(--text)', width: 100, flexShrink: 0 }}>{cat}</div>
            <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: CAT_COLORS[cat] || '#7b82a0',
                width: `${(amt / maxCat * 100).toFixed(1)}%`,
                animation: 'progressSweep 0.8s cubic-bezier(.4,0,.2,1) both',
                animationDelay: `${i * 0.08}s`,
                transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', width: 50, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${amt.toFixed(0)}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
