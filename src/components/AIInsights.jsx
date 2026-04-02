import React, { useState, useRef, useEffect } from 'react';

const CHIPS = [
  "How's my savings rate?",
  "Where am I overspending?",
  "Give me a spending breakdown",
  "How can I save more?",
  "Compare my income vs expenses",
  "Am I on track this month?",
];

function buildContext(transactions, budgets) {
  const expenses  = transactions.filter(t => t.type === 'expense');
  const income    = transactions.filter(t => t.type === 'income');
  const totalExp  = expenses.reduce((a, t) => a + t.amount, 0);
  const totalInc  = income.reduce((a, t) => a + t.amount, 0);
  const cats = {};
  expenses.forEach(t => { cats[t.cat] = (cats[t.cat] || 0) + t.amount; });
  const catStr = Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`${c}: $${v.toFixed(0)}`).join(', ');
  const budgetStatus = budgets.map(b => {
    const spent = expenses.filter(t => t.cat === b.cat).reduce((a,t)=>a+t.amount,0);
    return `${b.cat}: spent $${spent.toFixed(0)} of $${b.limit} (${((spent/b.limit)*100).toFixed(0)}%)`;
  }).join('; ');
  return `User's April 2026 finances — Income: $${totalInc.toFixed(0)}, Expenses: $${totalExp.toFixed(0)}, Savings: $${(totalInc-totalExp).toFixed(0)} (${((totalInc-totalExp)/totalInc*100).toFixed(1)}% rate). Spending by category: ${catStr}. Budgets: ${budgetStatus || 'none set'}.`;
}

export default function AIInsights({ transactions, budgets }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      const totalExp = transactions.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0);
      const totalInc = transactions.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0);
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm your AI financial advisor. I can see your April 2026 finances — you've earned $${totalInc.toFixed(0)} and spent $${totalExp.toFixed(0)} so far. Ask me anything about your spending patterns, budget goals, or how to save more!`,
      }]);
    }
  }, []);

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

    const context = buildContext(transactions, budgets);
    const system = `You are a concise, friendly financial advisor embedded in FinFlow dashboard. You have the user's real data: ${context}. Answer helpfully in plain text (no markdown symbols). Keep responses under 120 words unless a breakdown is needed.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system,
          messages: newMessages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(c => c.type === 'text')?.text || "Sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
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
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>AI Financial Advisor</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Ask anything about your spending, savings, and financial health</div>
        </div>
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, animation: 'fadeUp 0.4s 0.15s both' }}>
        {CHIPS.map((c, i) => (
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
              <div style={{ background: 'var(--surface2)', padding: '12px 16px', borderRadius: 10, borderBottomLeftRadius: 3 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,0.2,0.4].map((d,i) => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', display: 'block', animation: `typingDot 1.2s ${d}s infinite` }} />
                  ))}
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
            placeholder="Ask about your finances…"
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
            Send ↑
          </button>
        </div>
      </div>
    </div>
  );
}
