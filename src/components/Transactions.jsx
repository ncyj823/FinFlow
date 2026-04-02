import React, { useState } from 'react';
import { Card, Badge, Btn, Modal, Field, Input, Select, EmptyState } from './UI';
import { CATEGORIES, EXPENSE_CATS } from '../data/mockData';
import { useUIStore } from '../store/uiStore';

function TxModal({ open, onClose, onSave, editing }) {
  const [desc, setDesc]   = useState(editing?.desc || '');
  const [amt, setAmt]     = useState(editing?.amount || '');
  const [date, setDate]   = useState(editing?.date || new Date().toISOString().split('T')[0]);
  const [type, setType]   = useState(editing?.type || 'expense');
  const [cat, setCat]     = useState(editing?.cat || 'Food');

  React.useEffect(() => {
    if (editing) { setDesc(editing.desc); setAmt(editing.amount); setDate(editing.date); setType(editing.type); setCat(editing.cat); }
    else { setDesc(''); setAmt(''); setDate(new Date().toISOString().split('T')[0]); setType('expense'); setCat('Food'); }
  }, [editing, open]);

  const handleSave = () => {
    if (!desc.trim() || !amt || !date) return;
    onSave({ desc: desc.trim(), amount: parseFloat(amt), date, type, cat });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Transaction' : 'Add Transaction'}>
      <Field label="Description">
        <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Netflix subscription" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Amount ($)">
          <Input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0.00" min="0" step="0.01" />
        </Field>
        <Field label="Date">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Type">
          <Select value={type} onChange={e => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
        </Field>
        <Field label="Category">
          <Select value={cat} onChange={e => setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </Select>
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Save Transaction'}</Btn>
      </div>
    </Modal>
  );
}

export default function Transactions({ transactions, role, onAdd, onUpdate, onDelete, onToast }) {
  const [search, setSearch]     = useState('');
  const [typeF, setTypeF]       = useState('');
  const [catF, setCatF]         = useState('');
  const [sort, setSort]         = useState('date-desc');
  const [modalOpen, setModal]   = useState(false);
  const [editing, setEditing]   = useState(null);
  const { lastAddedId }         = useUIStore();

  const filtered = transactions
    .filter(t => {
      const ms = t.desc.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase());
      return ms && (!typeF || t.type === typeF) && (!catF || t.cat === catF);
    })
    .sort((a, b) => {
      if (sort === 'date-desc')   return b.date.localeCompare(a.date);
      if (sort === 'date-asc')    return a.date.localeCompare(b.date);
      if (sort === 'amount-desc') return b.amount - a.amount;
      if (sort === 'amount-asc')  return a.amount - b.amount;
      return 0;
    });

  const handleSave = (data) => {
    if (editing) { onUpdate(editing.id, data); onToast('✏️ Transaction updated'); }
    else         { onAdd(data); onToast('✅ Transaction added'); }
    setEditing(null);
  };

  const openEdit = (t) => { setEditing(t); setModal(true); };
  const openAdd  = () => { setEditing(null); setModal(true); };

  const handleDelete = (id) => { onDelete(id); onToast('🗑️ Transaction deleted'); };

  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 8, color: 'var(--text)', padding: '8px 12px',
    fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none',
  };

  return (
    <div>
      <TxModal open={modalOpen} onClose={() => { setModal(false); setEditing(null); }} onSave={handleSave} editing={editing} />

      <Card hover={false} floatIndex={0} style={{ animation: 'springIn 0.4s cubic-bezier(.4,0,.2,1) both' }}>
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions…"
            style={{ ...inputStyle, flex: 1, minWidth: 180 }}
          />
          <select value={typeF} onChange={e => setTypeF(e.target.value)} style={inputStyle}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={catF} onChange={e => setCatF(e.target.value)} style={inputStyle}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} style={inputStyle}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
          {role === 'admin' && <Btn variant="primary" onClick={openAdd}>+ Add</Btn>}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState icon="🔍" sub="No transactions match your filters." />
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Date','Description','Category','Type','Amount', ...(role==='admin' ? ['Actions'] : [])].map(h => (
                    <th key={h} style={{ fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, padding: '10px 14px', textAlign: h === 'Amount' || h === 'Actions' ? 'right' : 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id}
                    className={t.id === lastAddedId ? 'tx-row-flash' : ''}
                    style={{ borderBottom: '1px solid var(--border)', animation: `fadeUp 0.3s ${i * 0.03}s both`, transition: 'background 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,143,255,0.03)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.transform = ''; }}
                  >
                    <td style={{ padding: '12px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{t.date}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 500 }}>{t.desc}</td>
                    <td style={{ padding: '12px 14px' }}><Badge variant="cat">{t.cat}</Badge></td>
                    <td style={{ padding: '12px 14px' }}><Badge variant={t.type}>{t.type}</Badge></td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: t.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </td>
                    {role === 'admin' && (
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <Btn variant="sm" onClick={() => openEdit(t)} style={{ marginRight: 4 }}>Edit</Btn>
                        <Btn variant="danger" onClick={() => handleDelete(t.id)} style={{ fontSize: 10, padding: '4px 8px' }}>Del</Btn>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: 11, color: 'var(--muted)', padding: '12px 14px 0' }}>
              Showing {filtered.length} of {transactions.length} transactions
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
