// @ts-nocheck
// ── Bus service ──

import api from '../lib/axios';
import { API_ENDPOINTS } from '../config/api.config';
import type { Bus, BusCreate, BusUpdate } from '../types/api';

export async function getBuses(): Promise<Bus[]> {
  const { data } = await api.get<Bus[]>(API_ENDPOINTS.buses.list);
  return data;
}

export async function getBus(id: number): Promise<Bus> {
  const { data } = await api.get<Bus>(API_ENDPOINTS.buses.detail(id));
  return data;
}

export async function createBus(payload: BusCreate): Promise<Bus> {
  const { data } = await api.post<Bus>(API_ENDPOINTS.buses.list, payload);
  return data;
}

export async function updateBus(id: number, payload: BusUpdate): Promise<Bus> {
  const { data } = await api.patch<Bus>(API_ENDPOINTS.buses.detail(id), payload);
  return data;
}

export async function deleteBus(id: number): Promise<void> {
  await api.delete(API_ENDPOINTS.buses.detail(id));
}
