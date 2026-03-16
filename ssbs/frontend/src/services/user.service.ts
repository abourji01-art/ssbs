// @ts-nocheck
// ── User service — CRUD for accounts ──

import api from '../lib/axios';
import { API_ENDPOINTS } from '../config/api.config';
import type { User, UserCreate, UserUpdate } from '../types/api';

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>(API_ENDPOINTS.users.list);
  return data;
}

export async function getUser(id: number): Promise<User> {
  const { data } = await api.get<User>(API_ENDPOINTS.users.detail(id));
  return data;
}

export async function createUser(payload: UserCreate): Promise<User> {
  const { data } = await api.post<User>(API_ENDPOINTS.users.list, payload);
  return data;
}

export async function updateUser(id: number, payload: UserUpdate): Promise<User> {
  const { data } = await api.patch<User>(API_ENDPOINTS.users.detail(id), payload);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(API_ENDPOINTS.users.detail(id));
}
