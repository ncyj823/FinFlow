import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLang } from '../context/LangContext';

function pct(n, d) {
  if (!d) return 0;
  return (n / d) * 100;
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7);
}

function formatSignedPct(value) {
  if (value === null || Number.isNaN(value)) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function buildAnalytics(transactions, budgets) {
  const incomeTx = transactions.filter(t => t.type === 'income');
  const expenseTx = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = pct(savings, totalIncome);

  const monthly = {};
  transactions.forEach((tx) => {
    const key = monthKey(tx.date);
    if (!monthly[key]) {
      monthly[key] = { income: 0, expense: 0, count: 0, largestExpense: null };
    }
    monthly[key].count += 1;
    if (tx.type === 'income') monthly[key].income += tx.amount;
    if (tx.type === 'expense') {
      monthly[key].expense += tx.amount;
      if (!monthly[key].largestExpense || tx.amount > monthly[key].largestExpense.amount) {
        monthly[key].largestExpense = tx;
      }
    }
  });

  const monthKeys = Object.keys(monthly).sort();
  const currentMonth = monthKeys[monthKeys.length - 1] || null;
  const previousMonth = monthKeys.length > 1 ? monthKeys[monthKeys.length - 2] : null;

  const currentData = currentMonth ? monthly[currentMonth] : { income: 0, expense: 0, count: 0, largestExpense: null };
  const previousData = previousMonth ? monthly[previousMonth] : null;

  const currentSavingsRate = pct(currentData.income - currentData.expense, currentData.income);
  const previousSavingsRate = previousData ? pct(previousData.income - previousData.expense, previousData.income) : null;

  const mom = {
    incomePct: previousData ? pct(currentData.income - previousData.income, previousData.income) : null,
    expensePct: previousData ? pct(currentData.expense - previousData.expense, previousData.expense) : null,
    savingsRatePct: previousSavingsRate === null ? null : currentSavingsRate - previousSavingsRate,
  };

  const currentMonthExpenses = expenseTx.filter(tx => monthKey(tx.date) === currentMonth);
  const categoryTotals = {};
  currentMonthExpenses.forEach((tx) => {
    categoryTotals[tx.cat] = (categoryTotals[tx.cat] || 0) + tx.amount;
  });
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, amount]) => ({ cat, amount, pct: pct(amount, currentData.expense) }));

  const budgetUsage = budgets.map((b) => {
    const spent = currentMonthExpenses
      .filter(tx => tx.cat === b.cat)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const usedPct = pct(spent, b.limit);
    return { ...b, spent, usedPct };
  });

  const budgetsOver80 = budgetUsage
    .filter(b => b.usedPct >= 80)
    .sort((a, b) => b.usedPct - a.usedPct);

  const largestExpense = currentData.largestExpense;

  return {
    totalIncome,
    totalExpenses,
    savings,
    savingsRate,
    currentMonth,
    previousMonth,
    txCountThisMonth: currentData.count,
    topCategories,
    budgetsOver80,
    largestExpense,
    mom,
  };
}

function buildContext(analytics) {
  const topCatLine = analytics.topCategories.length
    ? analytics.topCategories
        .map(c => `${c.cat}: $${c.amount.toFixed(0)} (${c.pct.toFixed(1)}% of monthly expenses)`)
        .join('; ')
    : 'No expense categories available';

  const budgetLine = analytics.budgetsOver80.length
    ? analytics.budgetsOver80
        .map(b => `${b.cat}: ${b.usedPct.toFixed(1)}% used ($${b.spent.toFixed(0)} of $${b.limit})`)
        .join('; ')
    : 'No budgets above 80% usage';

  const largestExpenseLine = analytics.largestExpense
    ? `${analytics.largestExpense.desc} in ${analytics.largestExpense.cat} for $${analytics.largestExpense.amount.toFixed(2)} on ${analytics.largestExpense.date}`
    : 'No expense transaction found for current month';

  const momLine = analytics.previousMonth
    ? `Month-over-month: income ${formatSignedPct(analytics.mom.incomePct)}, expenses ${formatSignedPct(analytics.mom.expensePct)}, savings rate ${formatSignedPct(analytics.mom.savingsRatePct)}.`
    : 'Month-over-month: not enough historical data to compare previous month.';

  return [
    'Finance dataset summary:',
    `- Total income: $${analytics.totalIncome.toFixed(2)}`,
    `- Total expenses: $${analytics.totalExpenses.toFixed(2)}`,
    `- Savings rate: ${analytics.savingsRate.toFixed(1)}%`,
    `- Top 3 spending categories this month: ${topCatLine}`,
    `- Budgets over 80% used: ${budgetLine}`,
    `- Number of transactions this month: ${analytics.txCountThisMonth}`,
    `- Largest single expense this month: ${largestExpenseLine}`,
    `- ${momLine}`,
  ].join('\n');
}

export default function AIInsights({ transactions, budgets }) {
  const { language, t } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);

  const chips = t('ai.chips');
  const analytics = useMemo(() => buildAnalytics(transactions, budgets), [transactions, budgets]);

  const proactiveInsights = useMemo(() => {
    const cards = [];

    if (analytics.budgetsOver80.length > 0) {
      const b = analytics.budgetsOver80[0];
      cards.push({
        icon: '⚠️',
        title: `${b.cat} budget is high`,
        text: `You've used ${b.usedPct.toFixed(0)}% of your ${b.cat} budget ($${b.spent.toFixed(0)} of $${b.limit}).`,
      });
    } else {
      cards.push({
        icon: '✅',
        title: 'Budget usage looks stable',
        text: 'No budget category is above 80% usage right now.',
      });
    }

    if (analytics.mom.savingsRatePct !== null) {
      const improved = analytics.mom.savingsRatePct >= 0;
      cards.push({
        icon: improved ? '✅' : '⚠️',
        title: improved ? 'Savings trend improved' : 'Savings trend declined',
        text: `Your savings rate changed by ${formatSignedPct(analytics.mom.savingsRatePct)} vs last month.`,
      });
    } else {
      cards.push({
        icon: 'ℹ️',
        title: 'Need one more month for trend',
        text: 'Add another month of transactions to unlock month-over-month insights.',
      });
    }

    if (analytics.largestExpense) {
      cards.push({
        icon: '💳',
        title: 'Largest expense spotted',
        text: `${analytics.largestExpense.desc} is your largest expense this month at $${analytics.largestExpense.amount.toFixed(2)}.`,
      });
    } else {
      cards.push({
        icon: '📌',
        title: 'No major expense yet',
        text: 'No expense transactions were found for the current month.',
      });
    }

    return cards.slice(0, 3);
  }, [analytics]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: t('ai.greeting', { income: analytics.totalIncome.toFixed(0), expense: analytics.totalExpenses.toFixed(0) }),
      }]);
    }
  }, [messages.length, t, analytics.totalIncome, analytics.totalExpenses]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const context = buildContext(analytics);
    const system = `You are a concise, friendly financial advisor embedded in FinFlow dashboard. You have the user's real data: ${context}. Answer helpfully in plain text (no markdown symbols). Keep responses under 120 words unless a breakdown is needed. ${t(`ai.systemPrompts.${language}`)}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system,
          messages: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(c => c.type === 'text')?.text || t('ai.processError');
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('ai.connectingError') }]);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
        padding: '20px 22px',
        background: 'linear-gradient(135deg, rgba(79,143,255,0.08), rgba(124,92,252,0.08))',
        border: '1px solid rgba(79,143,255,0.15)', borderRadius: 12,
        animation: 'springIn 0.45s cubic-bezier(.4,0,.2,1) both',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          animation: 'aiOrb 3.5s ease-in-out infinite',
        }}>✦</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{t('ai.title')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t('ai.subtitle')}</div>
        </div>
      </div>

      {/* Proactive insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
        marginBottom: 16,
      }}>
        {proactiveInsights.map((insight, idx) => (
          <div key={`${insight.title}-${idx}`} style={{
            background: 'linear-gradient(160deg, rgba(22, 29, 48, 0.66), rgba(15, 21, 37, 0.48))',
            border: '1px solid rgba(171, 194, 255, 0.18)',
            borderRadius: 10,
            padding: '10px 12px',
            animation: `fadeUp 0.35s ${0.1 + idx * 0.08}s both`,
          }}>
            <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>
              <span style={{ marginRight: 6 }}>{insight.icon}</span>
              {insight.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}>{insight.text}</div>
          </div>
        ))}
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, animation: 'fadeUp 0.4s 0.15s both' }}>
        {chips.map((c, i) => (
          <button key={c} onClick={() => send(c)} style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 20, padding: '6px 14px', fontSize: 12,
            color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
            animation: `fadeUp 0.35s ${0.15 + i * 0.06}s both`,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,143,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >{c}</button>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', animation: 'fadeUp 0.4s 0.22s both' }}>
        <div style={{ padding: 20, minHeight: 300, maxHeight: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              animation: 'fadeUp 0.3s cubic-bezier(.4,0,.2,1) both',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                background: m.role === 'assistant' ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)',
              }}>
                {m.role === 'assistant' ? '✦' : '👤'}
              </div>
              <div style={{
                padding: '11px 14px', borderRadius: 10, fontSize: 13, lineHeight: 1.6, maxWidth: '85%',
                background: m.role === 'user' ? 'rgba(79,143,255,0.15)' : 'var(--surface2)',
                borderBottomRightRadius: m.role === 'user' ? 3 : 10,
                borderBottomLeftRadius: m.role === 'assistant' ? 3 : 10,
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✦</div>
              <div style={{ background: 'var(--surface2)', padding: '12px 16px', borderRadius: 10, borderBottomLeftRadius: 3, minWidth: 170 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Analyzing your data...</div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 6 }}>
                  {[0,0.2,0.4].map((d,i) => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', display: 'block', animation: `typingDot 1.2s ${d}s infinite` }} />
                  ))}
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '45%', background: 'linear-gradient(90deg, var(--accent), var(--accent2))', animation: 'meshGradientFlow 3.4s ease-in-out infinite alternate' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(input); }}
            placeholder={t('ai.askPlaceholder')}
            style={{
              flex: 1, background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 8, color: 'var(--text)', padding: '9px 14px',
              fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e =>  { e.target.style.borderColor = 'var(--border2)'; }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? 'var(--surface2)' : 'var(--accent)',
              color: loading || !input.trim() ? 'var(--muted)' : '#fff',
              border: 'none', borderRadius: 8, padding: '9px 16px',
              fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
          >
            {t('ai.send')} ↑
          </button>
        </div>
      </div>
    </div>
  );
}
