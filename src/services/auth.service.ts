import { nestJsApi } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}

// Authentication service
export const login = async (credentials: LoginCredentials) => {
  return await nestJsApi.post<AuthResponse>('/auth/login', credentials);
};

export const register = async (userData: RegisterData) => {
  return await nestJsApi.post<AuthResponse>('/auth/register', userData);
};

export const logout = async () => {
  return await nestJsApi.post('/auth/logout');
};

export const validateToken = async (token: string) => {
  return await nestJsApi.post('/auth/validate-token', { token });
};
