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
  register: (values: Omit<RegisterFormValues, 'confirmPassword'>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, silently try to exchange the httpOnly refresh cookie for
  // a fresh access token so a page reload doesn't force a re-login.
  useEffect(() => {
    async function bootstrap() {
      try {
        const { accessToken } = await authService.refresh();
        setAccessToken(accessToken);
        const profile = await authService.getMe();
        setUser(profile);
      } catch {
        setAccessToken(null);
        setUser(null);
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
      register,
      logout,
      refreshUser,
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
