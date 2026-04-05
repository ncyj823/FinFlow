import { useCallback, useState } from 'react';
import { validateLogin } from './users';

const SESSION_KEY = 'finflow_session';
const AUTH_DELAY_MS = 1200;

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.email === 'string' &&
      typeof parsed.role === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.loggedInAt === 'string'
    ) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState(() => readSession());

  const getSession = useCallback(() => readSession(), []);

  const login = useCallback(async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, AUTH_DELAY_MS));

    const user = validateLogin(email, password);
    if (!user) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const nextSession = {
      email: user.email,
      role: user.role,
      name: user.name,
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);

    return { ok: true, session: nextSession };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return {
    session,
    login,
    logout,
    getSession,
  };
}
