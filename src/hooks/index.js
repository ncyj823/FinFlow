import { useState, useEffect, useCallback } from 'react';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_RECURRING } from '../data/mockData';
import { setLastAddedId } from '../store/uiStore';

// ── useLocalStorage ──
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);

  return [value, setValue];
}

// ── useTransactions ──
export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage('finflow_tx', INITIAL_TRANSACTIONS);

  const addTransaction = useCallback((tx) => {
    const newId = Date.now();
    setTransactions(prev => [{ ...tx, id: newId }, ...prev]);
    setLastAddedId(newId);
  }, [setTransactions]);

  const updateTransaction = useCallback((id, updates) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [setTransactions]);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  return { transactions, addTransaction, updateTransaction, deleteTransaction };
}

// ── useBudgets ──
export function useBudgets() {
  const [budgets, setBudgets] = useLocalStorage('finflow_budgets', INITIAL_BUDGETS);

  const addBudget = useCallback((b) => {
    setBudgets(prev => [...prev, { ...b, id: Date.now() }]);
  }, [setBudgets]);

  const deleteBudget = useCallback((id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, [setBudgets]);

  return { budgets, addBudget, deleteBudget };
}

// ── useRecurring ──
export function useRecurring() {
  const [recurring, setRecurring] = useState(INITIAL_RECURRING);

  const addRecurring = useCallback((r) => {
    setRecurring(prev => [{ ...r, id: Date.now(), active: true }, ...prev]);
  }, []);

  const toggleRecurring = useCallback((id) => {
    setRecurring(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  }, []);

  const deleteRecurring = useCallback((id) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
  }, []);

  return { recurring, addRecurring, toggleRecurring, deleteRecurring };
}

// ── useFilters ──
export function useFilters() {
  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('');
  const [catFilter, setCat]   = useState('');
  const [sortBy, setSortBy]   = useState('date-desc');

  const filterTransactions = useCallback((transactions) => {
    let list = transactions.filter(t => {
      const matchSearch = t.desc.toLowerCase().includes(search.toLowerCase())
        || t.cat.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || t.type === typeFilter;
      const matchCat  = !catFilter  || t.cat  === catFilter;
      return matchSearch && matchType && matchCat;
    });

    return list.sort((a, b) => {
      if (sortBy === 'date-desc')   return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc')    return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc')  return a.amount - b.amount;
      return 0;
    });
  }, [search, typeFilter, catFilter, sortBy]);

  return { search, setSearch, typeFilter, setType, catFilter, setCat, sortBy, setSortBy, filterTransactions };
}

// ── useCountUp ──
// Animates a number from 0 → target over `duration` ms with easeOut (quartic).
// Returns the current animated value (a float).
export function useCountUp(target, duration = 1200, trigger = true) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!trigger) { setDisplay(0); return; }

    let rafId;
    const start = performance.now();

    const frame = (now) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      // easeOutQuart: fast start, smooth deceleration
      const ease = 1 - Math.pow(1 - p, 4);
      setDisplay(target * ease);
      if (p < 1) rafId = requestAnimationFrame(frame);
      else setDisplay(target);               // clamp to exact target
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId); // cleanup on unmount / re-trigger
  }, [target, duration, trigger]);

  return display;
}
