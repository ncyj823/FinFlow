import React, { useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Card, Badge, ScrambleNumber } from './UI';
import { CAT_COLORS, TREND_DATA } from '../data/mockData';
import { useLang } from '../context/LangContext';

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

function TermTooltip({ term, explanation }) {
  return (
    <span className="term-help" tabIndex={0} aria-label={`${term}: ${explanation}`}>
      ?
      <span className="term-help-bubble">{explanation}</span>
    </span>
  );
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

export default function Dashboard({ transactions }) {
  const { t } = useLang();
  const [trendTab, setTrendTab] = useState('6m');

  const incomeTotal = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTotal = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = incomeTotal - expenseTotal;
  const savingsRate = incomeTotal > 0 ? (balance / incomeTotal) * 100 : 0;
  const expenseRatio = incomeTotal > 0 ? expenseTotal / incomeTotal : 1;

  let healthScore = 50;
  healthScore += clamp(savingsRate * 0.6, -10, 30);
  healthScore += expenseRatio < 0.7 ? 15 : expenseRatio < 0.9 ? 8 : -10;
  healthScore += transactions.filter(t => t.type === 'income').length >= 2 ? 5 : 0;
  if (expenseRatio > 1) healthScore -= 15;
  healthScore = Math.round(clamp(healthScore, 0, 100));

  const healthSummary =
    healthScore >= 80
      ? t('dashboard.health.healthy')
      : healthScore >= 60
        ? t('dashboard.health.stable')
        : t('dashboard.health.overspending');

  const balanceInterpretation =
    balance >= 0
      ? t('dashboard.interpretations.balancePositive')
      : t('dashboard.interpretations.balanceNegative');

  const incomeInterpretation =
    incomeTotal >= 5000
      ? t('dashboard.interpretations.incomeStrong')
      : t('dashboard.interpretations.incomeModest');

  const expenseInterpretation =
    expenseRatio <= 0.7
      ? t('dashboard.interpretations.expenseControlled')
      : expenseRatio <= 1
        ? t('dashboard.interpretations.expenseHigh')
        : t('dashboard.interpretations.expenseOver');

  const savingsInterpretation =
    savingsRate >= 50
      ? t('dashboard.interpretations.savingsGreat')
      : savingsRate >= 20
        ? t('dashboard.interpretations.savingsGood')
        : savingsRate >= 0
          ? t('dashboard.interpretations.savingsLow')
          : t('dashboard.interpretations.savingsNegative');

  const healthColor = healthScore >= 80 ? 'var(--green)' : healthScore >= 60 ? 'var(--amber)' : 'var(--red)';

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
      { label: t('dashboard.legends.balance'), data: td.balance, borderColor: '#4f8fff', backgroundColor: 'rgba(79,143,255,0.08)', tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: '#4f8fff', borderWidth: 2 },
      { label: t('dashboard.legends.income'),  data: td.income,  borderColor: '#2dd4a0', backgroundColor: 'transparent', tension: 0.4, fill: false, pointRadius: 3, borderDash: [4,3], borderWidth: 2 },
      { label: t('dashboard.legends.expenses'),data: td.expenses,borderColor: '#f06a6a', backgroundColor: 'transparent', tension: 0.4, fill: false, pointRadius: 3, borderDash: [4,3], borderWidth: 2 },
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
      <div className="dashboard-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card floatIndex={0} className="summary-card" data-index={0} style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="summary-card-label" style={{ fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('dashboard.labels.balance')}
            <TermTooltip term={t('dashboard.labels.balance')} explanation={t('dashboard.terms.balance')} />
          </div>
          <div className="summary-card-value metric-display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1.3px', color: 'var(--accent)', animation: 'countUp 0.5s 0.3s both' }}>
            <ScrambleNumber value={Math.round(balance)} prefix="₹" duration={900} />
          </div>
          <div style={{ fontSize: 11, marginTop: 6, color: balance >= 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {balance >= 0 ? `▲ ${t('dashboard.cardNotes.balancePositive')}` : `▼ ${t('dashboard.cardNotes.balanceNegative')}`}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}>
            {balanceInterpretation}
          </div>
        </Card>

        <Card floatIndex={1} className="summary-card" data-index={1} style={{ borderLeft: '4px solid var(--green)' }}>
          <div className="summary-card-label" style={{ fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('dashboard.labels.income')}
            <TermTooltip term={t('dashboard.labels.income')} explanation={t('dashboard.terms.income')} />
          </div>
          <div className="summary-card-value metric-display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1.3px', color: 'var(--green)', animation: 'countUp 0.5s 0.3s both' }}>
            <ScrambleNumber value={Math.round(incomeTotal)} prefix="₹" duration={900} />
          </div>
          <div style={{ fontSize: 11, marginTop: 6, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ▲ {t('dashboard.cardNotes.incomeNote')}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}>
            {incomeInterpretation}
          </div>
        </Card>

        <Card floatIndex={2} className="summary-card" data-index={2} style={{ borderLeft: '4px solid var(--red)' }}>
          <div className="summary-card-label" style={{ fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('dashboard.labels.expense')}
            <TermTooltip term={t('dashboard.labels.expense')} explanation={t('dashboard.terms.expense')} />
          </div>
          <div className="summary-card-value metric-display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1.3px', color: 'var(--red)', animation: 'countUp 0.5s 0.3s both' }}>
            <ScrambleNumber value={Math.round(expenseTotal)} prefix="₹" duration={900} />
          </div>
          <div style={{ fontSize: 11, marginTop: 6, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ▼ {t('dashboard.cardNotes.expenseNote')}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}>
            {expenseInterpretation}
          </div>
        </Card>

        <Card floatIndex={3} className="summary-card" data-index={3} style={{ borderLeft: '4px solid var(--amber)' }}>
          <div className="summary-card-label" style={{ fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('dashboard.labels.savingsRate')}
            <TermTooltip term={t('dashboard.labels.savingsRate')} explanation={t('dashboard.terms.savingsRate')} />
          </div>
          <div className="summary-card-value metric-display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1.3px', color: 'var(--amber)', animation: 'countUp 0.5s 0.3s both' }}>
            <ScrambleNumber value={savingsRate} suffix="%" decimals={1} duration={900} />
          </div>
          <div style={{ fontSize: 11, marginTop: 6, color: savingsRate >= 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {savingsRate >= 0 ? `▲ ${t('dashboard.cardNotes.savingsPositive')}` : `▼ ${t('dashboard.cardNotes.savingsNegative')}`}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}>
            {savingsInterpretation}
          </div>
        </Card>

        <Card floatIndex={4} className="summary-card" data-index={4} style={{ borderLeft: `4px solid ${healthColor}` }}>
          <div className="summary-card-label" style={{ fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
            {t('dashboard.labels.healthScore')}
          </div>
          <div className="summary-card-value metric-display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1.3px', color: healthColor, animation: 'countUp 0.5s 0.3s both' }}>
            <ScrambleNumber value={Math.round(healthScore)} duration={900} />/100
          </div>
          <div style={{ fontSize: 11, marginTop: 6, color: healthColor, display: 'flex', alignItems: 'center', gap: 4 }}>
            ● {t('dashboard.cardNotes.healthNote')}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}>
            {healthSummary}
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card floatIndex={4} hover={false}>
          <div className="chart-header" style={s.chartHeader}>
            <div>
              <div style={s.chartTitle}>{t('dashboard.chart.balanceTrend')}</div>
              <div style={s.chartSub}>{t('dashboard.chart.balanceSub')}</div>
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
            {[
              ['#4f8fff', t('dashboard.legends.balance')],
              ['#2dd4a0', t('dashboard.legends.income')],
              ['#f06a6a', t('dashboard.legends.expenses')],
            ].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
              </div>
            ))}
          </div>
        </Card>

        <Card floatIndex={5} hover={false}>
          <div className="chart-header" style={s.chartHeader}>
            <div>
              <div style={s.chartTitle}>{t('dashboard.chart.spendCategory')}</div>
              <div style={s.chartSub}>{t('dashboard.chart.currentMonth')}</div>
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
              <span className="amount-mono" style={{ fontSize: 12, color: 'var(--text)' }}>${catVals[i].toFixed(0)}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card floatIndex={6} hover={false}>
        <div className="chart-header" style={{ ...s.chartHeader, marginBottom: 16 }}>
          <div style={s.chartTitle}>{t('dashboard.chart.recentTransactions')}</div>
        </div>
        <div className="transactions-table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[t('dashboard.table.date'), t('dashboard.table.description'), t('dashboard.table.category'), t('dashboard.table.type'), t('dashboard.table.amount')].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((t, i) => (
                <tr key={t.id} style={{ animation: `fadeUp 0.3s ${i * 0.05}s both`, borderBottom: '1px solid var(--border)' }}>
                  <td className="amount-mono" style={{ ...s.td, color: 'var(--muted)', fontSize: 11 }}>{t.date}</td>
                  <td style={{ ...s.td, fontWeight: 500 }}>{t.desc}</td>
                  <td style={s.td}><Badge variant="cat">{t.cat}</Badge></td>
                  <td style={s.td}><Badge variant={t.type}>{t.type}</Badge></td>
                  <td className="amount-mono" style={{ ...s.td, textAlign: 'right', color: t.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
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
