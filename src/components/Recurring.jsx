import React, { useState } from 'react';
import { Card, Badge, Btn, Modal, Field, Input, Select, EmptyState } from './UI';
import { CATEGORIES, REC_ICONS } from '../data/mockData';
import { useLang } from '../context/LangContext';

function RecModal({ open, onClose, onSave }) {
  const { t } = useLang();
  const [desc, setDesc]   = useState('');
  const [amt, setAmt]     = useState('');
  const [freq, setFreq]   = useState('monthly');
  const [type, setType]   = useState('expense');
  const [cat, setCat]     = useState('Entertainment');
  const [date, setDate]   = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!desc.trim() || !amt || !date) return;
    onSave({ desc: desc.trim(), amount: parseFloat(amt), freq, type, cat, nextDate: date });
    setDesc(''); setAmt(''); onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('recurring.modal.title')}>
      <Field label={t('recurring.modal.descLabel')}>
        <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder={t('recurring.modal.descPlaceholder')} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={t('recurring.modal.amountLabel')}>
          <Input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0.00" min="0" step="0.01" />
        </Field>
        <Field label={t('recurring.modal.frequencyLabel')}>
          <Select value={freq} onChange={e => setFreq(e.target.value)}>
            <option value="monthly">{t('common.monthly')}</option>
            <option value="weekly">{t('common.weekly')}</option>
            <option value="yearly">{t('common.yearly')}</option>
          </Select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={t('recurring.modal.typeLabel')}>
          <Select value={type} onChange={e => setType(e.target.value)}>
            <option value="expense">{t('common.expense')}</option>
            <option value="income">{t('common.income')}</option>
          </Select>
        </Field>
        <Field label={t('recurring.modal.categoryLabel')}>
          <Select value={cat} onChange={e => setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </Select>
        </Field>
      </div>
      <Field label={t('recurring.modal.nextDue')}>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose}>{t('common.cancel')}</Btn>
        <Btn variant="primary" onClick={handleSave}>{t('recurring.modal.add')}</Btn>
      </div>
    </Modal>
  );
}

export default function Recurring({ recurring, role, onAdd, onToggle, onDelete, onToast }) {
  const { t } = useLang();
  const [modalOpen, setModal] = useState(false);

  const toMonthly = (r) => r.freq === 'weekly' ? r.amount * 4.33 : r.freq === 'yearly' ? r.amount / 12 : r.amount;

  const activeExpense = recurring.filter(r => r.active && r.type === 'expense');
  const activeIncome  = recurring.filter(r => r.active && r.type === 'income');
  const monthlyOut = activeExpense.reduce((a, r) => a + toMonthly(r), 0);
  const monthlyIn  = activeIncome.reduce((a, r) => a + toMonthly(r), 0);
  const net = monthlyIn - monthlyOut;

  return (
    <div>
      <RecModal open={modalOpen} onClose={() => setModal(false)}
        onSave={(r) => { onAdd(r); onToast(`✅ ${t('toasts.recurringAdded')}`); }} />

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: t('recurring.summary.monthlyOut'), value: `$${monthlyOut.toFixed(0)}`, sub: t('recurring.summary.activeSubs', { count: activeExpense.length }), color: 'var(--red)',   accent: 'var(--red)' },
          { label: t('recurring.summary.monthlyIn'),  value: `$${monthlyIn.toFixed(0)}`,  sub: t('recurring.summary.recurringIncome', { count: activeIncome.length }), color: 'var(--green)', accent: 'var(--green)' },
          { label: t('recurring.summary.net'), value: `${net>=0?'+':''}$${net.toFixed(0)}`, sub: net >= 0 ? `▲ ${t('recurring.summary.netPositive')}` : `▼ ${t('recurring.summary.netOutflow')}`, color: 'var(--amber)', accent: 'var(--amber)' },
        ].map((c, i) => (
          <Card key={c.label} floatIndex={i} style={{ borderTop: `2px solid ${c.accent}` }}>
            <div style={{ fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-mono)', color: c.color, animation: 'countUp 0.5s 0.2s both' }}>{c.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{c.sub}</div>
          </Card>
        ))}
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{t('recurring.title')}</div>
        {role === 'admin' && <Btn variant="primary" onClick={() => setModal(true)}>+ {t('recurring.addButton')}</Btn>}
      </div>

      {/* Cards Grid */}
      {recurring.length === 0 ? (
        <EmptyState icon="🔁" title={t('recurring.empty.title')} sub={t('recurring.empty.sub')} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {recurring.map((r, i) => {
            const iconBg    = r.type === 'income' ? 'rgba(45,212,160,0.12)' : 'rgba(255,255,255,0.06)';
            const amtColor  = r.type === 'income' ? 'var(--green)' : 'var(--text)';
            const freqLabel = r.freq === 'monthly' ? t('common.monthly') : r.freq === 'weekly' ? t('common.weekly') : t('common.yearly');
            return (
              <Card key={r.id} floatIndex={i + 3} style={{ opacity: r.active ? 1 : 0.5, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {REC_ICONS[r.cat] || '📄'}
                  </div>
                  <Badge variant={r.active ? 'active' : 'paused'}>{r.active ? t('common.active') : t('common.paused')}</Badge>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.desc}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{freqLabel} · {r.cat}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)', color: amtColor }}>
                  {r.type === 'income' ? '+' : '-'}${r.amount.toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t('common.next')}: {r.nextDate}</div>
                {role === 'admin' && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <Btn variant="sm" onClick={() => { onToggle(r.id); onToast(r.active ? `⏸ ${t('toasts.recurringPaused')}` : `▶ ${t('toasts.recurringResumed')}`); }} style={{ flex: 1, justifyContent: 'center' }}>
                      {r.active ? t('recurring.pause') : t('recurring.resume')}
                    </Btn>
                    <Btn variant="danger" onClick={() => { onDelete(r.id); onToast(`🗑️ ${t('toasts.recurringRemoved')}`); }} style={{ fontSize: 10, padding: '4px 8px' }}>{t('common.deleteShort')}</Btn>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
