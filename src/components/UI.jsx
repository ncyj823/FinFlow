import React, { useEffect, useRef } from 'react';

/* ── FLOATING CARD ── */
export function Card({ children, style, floatIndex = 0, hover = true, className = '', ...rest }) {
  const floatAnims = ['levitate', 'levitate2', 'levitate3'];
  const durations  = [6, 7, 5.5, 8, 6.5, 7.5];
  const delays     = [0, 0.8, 1.4, 2.1, 0.4, 1.8];
  const anim = floatAnims[floatIndex % 3];
  const dur  = durations[floatIndex % durations.length];
  const del  = delays[floatIndex % delays.length];

  return (
    <div
      className={`finflow-card ${className}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 22px',
        animation: `springIn 0.45s ${floatIndex * 0.07}s cubic-bezier(.4,0,.2,1) both, ${anim} ${dur}s ${del}s ease-in-out infinite`,
        transition: hover ? 'transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s, border-color 0.2s' : 'none',
        cursor: 'default',
        ...style,
      }}
      onMouseEnter={e => {
        if (!hover) return;
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.012)';
        e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,143,255,0.15)';
        e.currentTarget.style.animationPlayState = 'paused';
      }}
      onMouseLeave={e => {
        if (!hover) return;
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.animationPlayState = 'running';
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── BADGE ── */
export function Badge({ children, variant = 'cat' }) {
  const colors = {
    income:  { background: 'rgba(45,212,160,0.12)',  color: 'var(--green)' },
    expense: { background: 'rgba(240,106,106,0.12)', color: 'var(--red)' },
    cat:     { background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', border: '1px solid var(--border2)' },
    active:  { background: 'rgba(45,212,160,0.12)',  color: 'var(--green)' },
    paused:  { background: 'rgba(245,167,66,0.12)',  color: 'var(--amber)' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 20,
      fontSize: 10, fontWeight: 500,
      transition: 'transform 0.15s, filter 0.15s',
      ...colors[variant],
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.filter = 'brightness(1.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.filter = ''; }}
    >
      {children}
    </span>
  );
}

/* ── BUTTON ── */
export function Btn({ children, onClick, variant = 'ghost', style, disabled }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8,
    fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', position: 'relative', overflow: 'hidden',
    transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    ghost:   { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)',  border: '1px solid var(--border2)' },
    primary: { background: 'var(--accent)', color: '#fff' },
    danger:  { background: 'rgba(240,106,106,0.15)', color: 'var(--red)', border: '1px solid rgba(240,106,106,0.2)' },
    sm:      { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border2)', padding: '4px 8px', fontSize: 10 },
  };

  const handleClick = (e) => {
    if (disabled) return;
    // Ripple
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.25);
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;
      transform:scale(0);animation:rippleAnim 0.5s linear;pointer-events:none;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
    onClick && onClick(e);
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,143,255,0.4)';
          e.currentTarget.style.background = '#6fa3ff';
        } else {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.background = variants[variant].background;
        e.currentTarget.style.color = variants[variant].color;
      }}
    >
      {children}
    </button>
  );
}

/* ── MODAL ── */
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      style={mStyles.overlay}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={mStyles.modal}>
        <button style={mStyles.close} onClick={onClose}>✕</button>
        <div style={mStyles.title}>{title}</div>
        {children}
      </div>
    </div>
  );
}

const mStyles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'overlayIn 0.2s ease both',
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: 16, padding: 28,
    width: 420, maxWidth: '90vw',
    position: 'relative',
    animation: 'modalPop 0.35s cubic-bezier(.4,0,.2,1) both',
  },
  title: { fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--text)' },
  close: {
    position: 'absolute', top: 16, right: 16,
    background: 'none', border: 'none',
    color: 'var(--muted)', fontSize: 18,
    cursor: 'pointer', width: 28, height: 28,
    borderRadius: 6, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-sans)',
  },
};

/* ── FORM FIELD ── */
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ style, ...props }) {
  return (
    <input
      style={{
        width: '100%', background: 'var(--surface2)',
        border: '1px solid var(--border2)', borderRadius: 8,
        color: 'var(--text)', padding: '9px 12px',
        fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,143,255,0.15)'; }}
      onBlur={e =>  { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = ''; }}
      {...props}
    />
  );
}

export function Select({ style, children, ...props }) {
  return (
    <select
      style={{
        width: '100%', background: 'var(--surface2)',
        border: '1px solid var(--border2)', borderRadius: 8,
        color: 'var(--text)', padding: '9px 12px',
        fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none',
        cursor: 'pointer', transition: 'border-color 0.2s',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
      onBlur={e =>  { e.target.style.borderColor = 'var(--border2)'; }}
      {...props}
    >
      {children}
    </select>
  );
}

/* ── TOAST ── */
export function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      background: 'var(--surface2)',
      border: '1px solid var(--border2)',
      borderRadius: 10, padding: '12px 18px',
      fontSize: 13, color: 'var(--text)',
      zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 8,
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(80px) scale(0.9)',
      transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
      animation: visible ? 'toastBounce 0.45s cubic-bezier(.4,0,.2,1) both' : 'none',
    }}>
      {message}
    </div>
  );
}

/* ── EMPTY STATE ── */
export function EmptyState({ icon = '🔍', title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)', animation: 'fadeUp 0.4s both' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      {title && <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 6 }}>{title}</div>}
      <div style={{ fontSize: 12 }}>{sub}</div>
    </div>
  );
}
