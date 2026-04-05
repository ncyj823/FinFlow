import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

/* ── MAGNETIC TILT CARD ── */
export function Card({ children, style, floatIndex = 0, hover = true, className = '', ...rest }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);
  const springRotX = useSpring(rotateX, { stiffness: 320, damping: 28 });
  const springRotY = useSpring(rotateY, { stiffness: 320, damping: 28 });

  const handleMouseMove = useCallback((e) => {
    if (!hover || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width  - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  }, [hover, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0); y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className={`finflow-card ${className}`}
      style={{
        background: 'linear-gradient(160deg, rgba(22, 29, 48, 0.62), rgba(15, 21, 37, 0.46))',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.11)',
        borderRight: '1px solid rgba(169, 193, 255, 0.18)',
        borderBottom: '1px solid rgba(169, 193, 255, 0.14)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: '20px 22px',
        transformStyle: 'preserve-3d',
        rotateX: hover ? springRotX : 0,
        rotateY: hover ? springRotY : 0,
        ...style,
      }}
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: floatIndex * 0.07,
        type: 'spring',
        stiffness: 260,
        damping: 22,
        mass: 0.9,
      }}
      whileHover={hover ? { boxShadow: '0 24px 56px rgba(5,9,20,0.55), 0 0 0 1px rgba(110,152,255,0.22)' } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </motion.div>
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
    <motion.span
      style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '3px 9px', borderRadius: 20,
        fontSize: 10, fontWeight: 500,
        ...colors[variant],
      }}
      whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.span>
  );
}

/* ── BUTTON with ripple ── */
export function Btn({ children, onClick, variant = 'ghost', style, disabled }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8,
    fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', position: 'relative', overflow: 'hidden',
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
    const btn  = e.currentTarget;
    const ripple = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.25);
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;
      transform:scale(0);animation:rippleAnim 0.5s linear;pointer-events:none;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
    onClick && onClick(e);
  };

  return (
    <motion.button
      style={{ ...base, ...variants[variant], ...style }}
      onClick={handleClick}
      disabled={disabled}
      whileHover={disabled ? {} : {
        y: variant === 'primary' ? -2 : 0,
        boxShadow: variant === 'primary' ? '0 6px 20px rgba(79,143,255,0.4)' : 'none',
        background: variant === 'primary' ? '#6fa3ff' : 'rgba(255,255,255,0.08)',
      }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}

/* ── SPRING MODAL ── */
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={mStyles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            style={mStyles.modal}
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: [0.88, 1.02, 1], y: [24, -4, 0] }}
            exit={{   opacity: 0, scale: 0.92,  y: 16 }}
            transition={{ duration: 0.42, times: [0, 0.7, 1], ease: [0.22, 1, 0.36, 1] }}
          >
            <button style={mStyles.close} onClick={onClose}>✕</button>
            <div style={mStyles.title}>{title}</div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const mStyles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  modal: {
    background: 'rgba(15, 21, 37, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 16, padding: 28,
    width: 420, maxWidth: '90vw',
    position: 'relative',
    backdropFilter: 'blur(12px)',
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
        width: '100%', background: 'rgba(22, 29, 48, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8,
        color: 'var(--text)', padding: '9px 12px',
        fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none',
        transition: 'all 0.2s',
        backdropFilter: 'blur(4px)',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(79, 143, 255, 0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,143,255,0.1)'; e.target.style.backdropFilter = 'blur(8px)'; }}
      onBlur={e =>  { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = ''; e.target.style.backdropFilter = 'blur(4px)'; }}
      {...props}
    />
  );
}

export function Select({ style, children, ...props }) {
  return (
    <select
      style={{
        width: '100%', background: 'rgba(22, 29, 48, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8,
        color: 'var(--text)', padding: '9px 12px',
        fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none',
        cursor: 'pointer', transition: 'all 0.2s',
        backdropFilter: 'blur(4px)',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(79, 143, 255, 0.3)'; e.target.style.backdropFilter = 'blur(8px)'; }}
      onBlur={e =>  { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.backdropFilter = 'blur(4px)'; }}
      {...props}
    >
      {children}
    </select>
  );
}

/* ── NUMBER SCRAMBLE ── */
const CHARS = '0123456789';
export function ScrambleNumber({ value, prefix = '', suffix = '', decimals = 0, duration = 900 }) {
  const [display, setDisplay] = useState('0');
  const frameRef = useRef(null);

  useEffect(() => {
    const target  = Number(value);
    const start   = performance.now();
    let iteration = 0;

    const animate = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = (target * eased).toFixed(decimals);
      const chars    = current.toString().split('');

      // Scramble unrevealed digits
      const scrambled = chars.map((ch, i) => {
        if (ch === '.' || ch === ',') return ch;
        if (i < Math.floor(chars.length * eased)) return ch;
        return CHARS[Math.floor(Math.random() * 10)];
      }).join('');

      setDisplay(scrambled);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      else setDisplay(target.toLocaleString('en-IN', { minimumFractionDigits: decimals }));
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration, decimals]);

  return <span style={{ fontFamily: 'var(--font-mono)' }}>{prefix}{display}{suffix}</span>;
}

/* ── TOAST ── */
export function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={{
            position: 'fixed', bottom: 24, right: 24,
            background: 'rgba(15, 21, 37, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10, padding: '12px 18px',
            fontSize: 13, color: 'var(--text)',
            zIndex: 200,
            display: 'flex', alignItems: 'center', gap: 8,
            pointerEvents: 'none',
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,  scale: 1   }}
          exit={{   opacity: 0, y: 20,  scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── EMPTY STATE ── */
export function EmptyState({ icon = '🔍', title, sub }) {
  return (
    <motion.div
      style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        style={{ fontSize: 36, marginBottom: 12 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {icon}
      </motion.div>
      {title && <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 6 }}>{title}</div>}
      <div style={{ fontSize: 12 }}>{sub}</div>
    </motion.div>
  );
}
