import { apiClient } from './api-client';
import type { ApiEnvelope, RegisterResponseData, User } from './types';
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
} from './validators';

/**
 * One function per backend endpoint (src/auth/auth.routes.ts).
 * FRONTEND-05 §7 — "Never duplicate API request logic across pages."
 * Pages/components must call these, never call apiClient directly.
 */

export async function register(values: Omit<RegisterFormValues, 'confirmPassword'>) {
  const { data } = await apiClient.post<ApiEnvelope<RegisterResponseData>>('/auth/register', values);
  return data.data;
}

export async function login(values: LoginFormValues) {
  const { data } = await apiClient.post<ApiEnvelope<{ user: User; accessToken: string }>>('/auth/login', values);
  return data.data;
}

export async function loginWithGoogle(payload: { credential?: string; idToken?: string; accessToken?: string }) {
  const { data } = await apiClient.post<ApiEnvelope<{ user: User; accessToken: string; business?: RegisterResponseData['business'] }>>('/auth/google', payload);
  return data.data;
}

export async function refresh() {
  const { data } = await apiClient.post<ApiEnvelope<{ accessToken: string }>>('/auth/refresh');
  return data.data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function verifyEmail(token: string) {
  await apiClient.post('/auth/verify-email', { token });
}

export async function resendVerification(email: string) {
  await apiClient.post('/auth/resend-verification', { email });
}

export async function forgotPassword(values: ForgotPasswordFormValues) {
  await apiClient.post('/auth/forgot-password', values);
}

export async function resetPassword(token: string, values: Omit<ResetPasswordFormValues, 'confirmPassword'>) {
  await apiClient.post('/auth/reset-password', { token, newPassword: values.newPassword });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiClient.post('/auth/change-password', { currentPassword, newPassword });
}

export async function getMe() {
  const { data } = await apiClient.get<ApiEnvelope<User>>('/auth/me');
  return data.data;
}
