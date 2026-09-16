'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';
import * as authService from './auth-service';
import { setAccessToken } from './api-client';
import type { Business, User } from './types';
import type { LoginFormValues, RegisterFormValues } from './validators';

/**
 * FRONTEND-05 §3 & §5 — global state must track logged-in user, business
 * info, authentication status, and JWT session. This context is the single
 * source of truth for all of that on the client.
 */
interface AuthContextValue {
  user: User | null;
  business: Business | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  loginWithGoogle: (payload: { credential?: string; idToken?: string; accessToken?: string }) => Promise<void>;
  register: (values: Omit<RegisterFormValues, 'confirmPassword'>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  can: (...roles: string[]) => boolean;
  /**
   * Why the last session bootstrap failed:
   *  - 'session'  → the server rejected the session (401/403): the user really
   *                 is signed out and must log in again.
   *  - 'network'  → offline / backend cold start: the session is probably still
   *                 valid, so we must NOT send the user to /login.
   *  - null       → no failure.
   */
  authError: 'session' | 'network' | null;
  /** Re-runs the session bootstrap (used by the reconnect screen). */
  retryBootstrap: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<'session' | 'network' | null>(null);
  const [bootstrapNonce, setBootstrapNonce] = useState(0);

  // On first load, check if redirected back with Google OAuth tokens in hash,
  // or silently try to exchange the httpOnly refresh cookie for a fresh access token.
  useEffect(() => {
    // The access token lives in memory only, so every full page load (including
    // the browser Back button) must exchange the refresh cookie for a new token.
    // A single transient failure — Render cold starts take 30s+ — used to leave
    // the app without a session and bounce the user to /login. We now retry the
    // exchange with backoff and only treat the user as signed out when the
    // server explicitly rejects the session (401/403) or every retry failed.
    const REFRESH_RETRY_DELAYS_MS = [0, 1500, 4000, 8000];
    const lastRefreshFailureKey = '_rvRefreshFailedAt';

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    async function bootstrap() {
      setAuthError(null);
      try {
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash;
          const params = new URLSearchParams(hash);
          const idToken = params.get('id_token');
          const accessTokenParam = params.get('access_token');

          if (idToken || accessTokenParam) {
            window.history.replaceState(null, '', window.location.pathname);
            const result = await authService.loginWithGoogle({
              idToken: idToken || undefined,
              accessToken: accessTokenParam || undefined,
            });
            setAccessToken(result.accessToken);
            setUser(result.user);
            if (result.business) {
              setBusiness(result.business);
            }

            if (window.opener && window.opener !== window) {
              try {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, window.location.origin);
                window.close();
                return;
              } catch {
                // Continue in this tab if opener is inaccessible
              }
            }
            setIsLoading(false);
            return;
          }
        }

        let lastError: unknown = null;
        let sessionRejected = false;

        for (let attempt = 0; attempt < REFRESH_RETRY_DELAYS_MS.length; attempt++) {
          const delay = REFRESH_RETRY_DELAYS_MS[attempt];
          if (delay > 0) await sleep(delay);
          try {
            const { accessToken } = await authService.refresh();
            setAccessToken(accessToken);
            const profile = await authService.getMe();
            setUser(profile);
            if ((profile as any)?.business) {
              setBusiness((profile as any).business);
            }
            sessionStorage.removeItem(lastRefreshFailureKey);
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            const status = (err as { response?: { status?: number } })?.response?.status;
            // The server actively rejected the session — retrying cannot help.
            if (status === 401 || status === 403) {
              sessionRejected = true;
              break;
            }
          }
        }

        if (lastError) {
          setAccessToken(null);
          setUser(null);
          setBusiness(null);
          // 'session' = the server rejected the token → real logout.
          // 'network' = cold start / offline → keep the user on a reconnect
          // screen instead of bouncing them to /login.
          setAuthError(sessionRejected ? 'session' : 'network');
          sessionStorage.setItem(lastRefreshFailureKey, String(Date.now()));
        }
      } catch {
        setAccessToken(null);
        setUser(null);
        setBusiness(null);
        setAuthError('network');
        sessionStorage.setItem(lastRefreshFailureKey, String(Date.now()));
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, [bootstrapNonce]);

  async function login(values: LoginFormValues) {
    const result = await authService.login(values);
    setAccessToken(result.accessToken);
    setUser(result.user);
    try {
      const profile = await authService.getMe();
      setUser(profile);
      if ((profile as any)?.business) {
        setBusiness((profile as any).business);
      }
    } catch {
      // Minimal session fallback
    }
  }

  async function loginWithGoogle(payload: { credential?: string; idToken?: string; accessToken?: string }) {
    const result = await authService.loginWithGoogle(payload);
    setAccessToken(result.accessToken);
    setUser(result.user);
    if (result.business) {
      setBusiness(result.business);
    }
  }

  async function register(values: Omit<RegisterFormValues, 'confirmPassword'>) {
    const result = await authService.register(values);
    setAccessToken(result.accessToken);
    setUser(result.user);
    setBusiness(result.business);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setBusiness(null);
      toast.success('Logged out successfully.');
    }
  }

  async function refreshUser() {
    const profile = await authService.getMe();
    setUser(profile);
    if ((profile as any)?.business) {
      setBusiness((profile as any).business);
    }
  }

  const value = useMemo(
    () => ({
      user,
      business,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshUser,
      can: (...roles: string[]) => !!user && roles.includes(user.role),
      authError,
      retryBootstrap: () => {
        setIsLoading(true);
        setBootstrapNonce((n) => n + 1);
      },
    }),
    [user, business, isLoading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
