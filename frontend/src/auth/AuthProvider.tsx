import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchCurrentUser, logout as logoutRequest } from '../api/auth';
import type { AuthUser } from '../api/auth';
import { ApiError, errorMessage, setUnauthorizedHandler } from '../api/client';

type AuthState =
  | { kind: 'loading' }
  | { kind: 'anonymous' }
  | { kind: 'failed'; message: string }
  | { kind: 'signed'; user: AuthUser };

interface AuthContextValue {
  state: AuthState;
  signIn: (user: AuthUser) => void;
  signOut: () => Promise<void>;
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    fetchCurrentUser()
      .then((user) => !cancelled && setState({ kind: 'signed', user }))
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setState(
          error instanceof ApiError && error.status === 401
            ? { kind: 'anonymous' }
            : { kind: 'failed', message: errorMessage(error) },
        );
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    setUnauthorizedHandler(() => setState({ kind: 'anonymous' }));
    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = useCallback((user: AuthUser) => setState({ kind: 'signed', user }), []);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setState({ kind: 'anonymous' });
    }
  }, []);

  const value = useMemo(() => ({ state, signIn, signOut, retry }), [state, signIn, signOut, retry]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth вне AuthProvider');
  }
  return context;
}
