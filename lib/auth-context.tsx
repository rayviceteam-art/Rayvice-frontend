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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, check if redirected back with Google OAuth tokens in hash,
  // or silently try to exchange the httpOnly refresh cookie for a fresh access token.
  useEffect(() => {
    // Guard against rapid /auth/refresh calls (e.g. repeated failed registration
    // attempts or fast page reloads) triggering 429 rate-limit errors.
    const REFRESH_COOLDOWN_MS = 10_000;
    const lastRefreshKey = '_rvLastRefresh';

    async function bootstrap() {
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

        const lastRefresh = Number(sessionStorage.getItem(lastRefreshKey) ?? 0);
        if (Date.now() - lastRefresh < REFRESH_COOLDOWN_MS) {
          // Skip refresh this mount — a successful one already happened recently.
          setIsLoading(false);
          return;
        }
        sessionStorage.setItem(lastRefreshKey, String(Date.now()));

        const { accessToken } = await authService.refresh();
        setAccessToken(accessToken);
        const profile = await authService.getMe();
        setUser(profile);
      } catch {
        setAccessToken(null);
        setUser(null);
        // Clear the cooldown on failure so the next page load can retry immediately.
        sessionStorage.removeItem(lastRefreshKey);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);


  async function login(values: LoginFormValues) {
    const result = await authService.login(values);
    setAccessToken(result.accessToken);
    setUser(result.user);
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
    }),
    [user, business, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
