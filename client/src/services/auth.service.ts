import { api } from './api.js';
import type { User, AuthResponse, LoginFormData } from '../types/auth.types.js';

export async function registerApi(data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data.user;
}

export async function loginApi(data: LoginFormData): Promise<User> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data.user;
}

export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMeApi(): Promise<User> {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.data.user;
}
