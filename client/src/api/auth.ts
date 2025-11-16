import api from './client';
import { useAuthStore } from '../store/authStore';

export interface User {
  id: string;
  phone: string;
  name?: string;
  location?: string;
  role: 'user' | 'admin';
}

export const requestOTP = async (phone: string): Promise<void> => {
  await api.post('/auth/request-otp', { phone });
};

export const verifyOTP = async (
  phone: string,
  otp: string,
  name?: string,
  location?: string
): Promise<{ token: string; user: User }> => {
  const response = await api.post('/auth/verify-otp', {
    phone,
    otp,
    name,
    location,
  });
  const { token, user } = response.data;
  useAuthStore.getState().setAuth(user, token);
  return { token, user };
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data.user;
};

export const logout = () => {
  useAuthStore.getState().logout();
};

