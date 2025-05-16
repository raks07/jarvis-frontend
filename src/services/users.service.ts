import { nestJsApi } from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'editor' | 'viewer';
}

// User service
export const getUsers = async () => {
  return await nestJsApi.get<User[]>('/users');
};

export const getUserById = async (id: string) => {
  return await nestJsApi.get<User>(`/users/${id}`);
};

export const createUser = async (userData: CreateUserRequest) => {
  return await nestJsApi.post<User>('/users', userData);
};

export const updateUser = async (id: string, userData: UpdateUserRequest) => {
  return await nestJsApi.patch<User>(`/users/${id}`, userData);
};

export const deleteUser = async (id: string) => {
  return await nestJsApi.delete(`/users/${id}`);
};
