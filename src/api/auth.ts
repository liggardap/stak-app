import { apiClient } from './client';
import type { BaseResponse, ProblemDetail } from '@/types/api';
import type { UserResource } from '@/types/user';

export interface AuthResponse {
  token: string;
  user: UserResource;
}

export interface LoginPayload {
  email: string;
  password: string;
  audience: 'web';
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyEmailParams {
  id: string;
  hash: string;
  expires: string;
  signature: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<BaseResponse<AuthResponse>>('/api/v1/auth/login', payload);
  return data.data!;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post<BaseResponse<AuthResponse>>('/api/v1/auth/register', payload);
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout');
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/api/v1/auth/forgot-password', { email });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await apiClient.post('/api/v1/auth/reset-password', payload);
}

export async function verifyEmail(params: VerifyEmailParams): Promise<void> {
  await apiClient.get('/api/v1/auth/email/verify', { params });
}

export async function resendVerification(): Promise<void> {
  await apiClient.post('/api/v1/auth/email/resend');
}

export async function getMe(): Promise<UserResource> {
  const { data } = await apiClient.get<BaseResponse<UserResource>>('/api/v1/me');
  return data.data!;
}

export async function updateLocale(locale: string): Promise<void> {
  await apiClient.patch('/api/v1/me/locale', { locale });
}

export async function refreshToken(): Promise<string> {
  const { data } = await apiClient.post<BaseResponse<{ token: string }>>('/api/v1/auth/refresh');
  return data.data!.token;
}
