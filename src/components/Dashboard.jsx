import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Card, Badge } from './UI';
import { CAT_COLORS, TREND_DATA } from '../data/mockData';
import { useCountUp } from '../hooks';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 21, 37, 0.8)', titleColor: '#e8eaf2',
      bodyColor: '#7b82a0', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1,
      backdropFilter: 'blur(8px)',
      padding: 10,
    },
  },
};

function SummaryCard({ label, value, prefix = '', suffix = '', color, accentColor, change, changeUp, delay = 0 }) {
  const animated = useCountUp(value, 1200, true);

  // Format: use toLocaleString('en-IN') for Indian comma grouping (₹1,24,381)
  let display;
  if (value % 1 !== 0) {
    display = prefix + animated.toFixed(1) + suffix;
  } else {
    display = prefix + Math.round(animated).toLocaleString('en-IN') + suffix;
  }

  return (
    <Card floatIndex={delay} className="summary-card" data-index={delay} style={{ borderLeft: `4px solid ${accentColor}` }}>
      <div className="summary-card-label" style={{ fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
        {label}
      </div>
      <div className="summary-card-value" style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-display), 'Space Mono', monospace", letterSpacing: '-1.5px', color, animation: 'countUp 0.5s 0.3s both' }}>
        {display}
      </div>
      <div style={{ fontSize: 11, marginTop: 6, color: changeUp ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {changeUp ? '▲' : '▼'} {change}
      </div>
    </Card>
  );
}

export default function Dashboard({ transactions }) {
  const [trendTab, setTrendTab] = useState('6m');

  const expenses = transactions.filter(t => t.type === 'expense');
  const cats = {};
  expenses.forEach(t => { cats[t.cat] = (cats[t.cat] || 0) + t.amount; });
  const catLabels = Object.keys(cats);
  const catVals   = Object.values(cats);
  const catColors = catLabels.map(l => CAT_COLORS[l] || '#7b82a0');

  const td = TREND_DATA[trendTab];
  const trendData = {
    labels: td.labels,
    datasets: [
      { label: 'Balance', data: td.balance, borderColor: '#4f8fff', backgroundColor: 'rgba(79,143,255,0.08)', tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: '#4f8fff', borderWidth: 2 },
      { label: 'Income',  data: td.income,  borderColor: '#2dd4a0', backgroundColor: 'transparent', tension: 0.4, fill: false, pointRadius: 3, borderDash: [4,3], borderWidth: 2 },
      { label: 'Expenses',data: td.expenses,borderColor: '#f06a6a', backgroundColor: 'transparent', tension: 0.4, fill: false, pointRadius: 3, borderDash: [4,3], borderWidth: 2 },
    ],
  };

  const donutData = {
    labels: catLabels,
    datasets: [{ data: catVals, backgroundColor: catColors, borderColor: '#0f1525', borderWidth: 2, hoverOffset: 6 }],
  };

  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div>
      {/* Summary Cards */}
      <div className="dashboard-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <SummaryCard label="Total Balance"  value={24381} prefix="₹" color="var(--accent)" accentColor="var(--accent)" change="8.2% vs last month"  changeUp delay={0} />
        <SummaryCard label="Income (Apr)"   value={8450}  prefix="₹" color="var(--green)"  accentColor="var(--green)"  change="12.4% vs Mar"         changeUp delay={1} />
        <SummaryCard label="Expenses (Apr)" value={3820}  prefix="₹" color="var(--red)"    accentColor="var(--red)"    change="5.1% vs Mar"           changeUp={false} delay={2} />
        <SummaryCard label="Savings Rate"   value={54.8}  suffix="%" color="var(--amber)"  accentColor="var(--amber)"  change="3.2pp vs Mar"          changeUp delay={3} />
      </div>

      {/* Charts Row */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card floatIndex={4} hover={false}>
          <div className="chart-header" style={s.chartHeader}>
            <div>
              <div style={s.chartTitle}>Balance Trend</div>
              <div style={s.chartSub}>Running balance over time</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['6m','3m','1m'].map(t => (
                <button key={t} onClick={() => setTrendTab(t)} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11,
                  fontFamily: 'var(--font-sans)', cursor: 'pointer',
                  border: `1px solid ${trendTab === t ? 'rgba(79,143,255,0.25)' : 'transparent'}`,
                  background: trendTab === t ? 'rgba(79,143,255,0.15)' : 'none',
                  color: trendTab === t ? 'var(--accent)' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}>{t.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div style={{ height: 220, position: 'relative' }}>
            <Line data={trendData} options={{ ...CHART_OPTS, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7b82a0', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7b82a0', font: { size: 11 }, callback: v => '$' + (v/1000).toFixed(0) + 'k' } } } }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[['#4f8fff','Balance'],['#2dd4a0','Income'],['#f06a6a','Expenses']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
              </div>
            ))}
          </div>
        </Card>

        <Card floatIndex={5} hover={false}>
          <div className="chart-header" style={s.chartHeader}>
            <div>
              <div style={s.chartTitle}>Spending by Category</div>
              <div style={s.chartSub}>Current month</div>
            </div>
          </div>
          <div style={{ height: 180, position: 'relative', marginBottom: 12 }}>
            <Doughnut data={donutData} options={{ ...CHART_OPTS, cutout: '65%' }} />
          </div>
          {catLabels.slice(0, 5).map((l, i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: catColors[i] }} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{l}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>${catVals[i].toFixed(0)}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card floatIndex={6} hover={false}>
        <div className="chart-header" style={{ ...s.chartHeader, marginBottom: 16 }}>
          <div style={s.chartTitle}>Recent Transactions</div>
        </div>
        <div className="transactions-table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date','Description','Category','Type','Amount'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((t, i) => (
                <tr key={t.id} style={{ animation: `fadeUp 0.3s ${i * 0.05}s both`, borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...s.td, color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{t.date}</td>
                  <td style={{ ...s.td, fontWeight: 500 }}>{t.desc}</td>
                  <td style={s.td}><Badge variant="cat">{t.cat}</Badge></td>
                  <td style={s.td}><Badge variant={t.type}>{t.type}</Badge></td>
                  <td style={{ ...s.td, textAlign: 'right', fontFamily: 'var(--font-mono)', color: t.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const s = {
  chartHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  chartTitle:  { fontSize: 14, fontWeight: 500, color: 'var(--text)' },
  chartSub:    { fontSize: 11, color: 'var(--muted)', marginTop: 2 },
  th: { fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--border)' },
  td: { padding: '12px 14px', fontSize: 12 },
};
