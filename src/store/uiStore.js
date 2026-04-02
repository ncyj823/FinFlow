import { useSyncExternalStore } from 'react';

// ── Minimal Zustand-style store (no external deps) ──
// State
let state = { lastAddedId: null };

// Subscribers
const listeners = new Set();

function getSnapshot() {
  return state;
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setState(partial) {
  state = { ...state, ...partial };
  listeners.forEach((cb) => cb());
}

// ── Public API ──

/** Set the ID of the most-recently added transaction, auto-clears after 2000ms */
export function setLastAddedId(id) {
  setState({ lastAddedId: id });
  setTimeout(() => setState({ lastAddedId: null }), 2000);
}

/** React hook — returns the full ui store snapshot */
export function useUIStore() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
