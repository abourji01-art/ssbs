// @ts-nocheck
// ── Route service ──

import api from '../lib/axios';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiRoute, ApiRouteCreate, ApiRouteUpdate } from '../types/api';

export async function getRoutes(): Promise<ApiRoute[]> {
  const { data } = await api.get<ApiRoute[]>(API_ENDPOINTS.routes.list);
  return data;
}

export async function getRoute(id: number): Promise<ApiRoute> {
  const { data } = await api.get<ApiRoute>(API_ENDPOINTS.routes.detail(id));
  return data;
}

export async function createRoute(payload: ApiRouteCreate): Promise<ApiRoute> {
  const { data } = await api.post<ApiRoute>(API_ENDPOINTS.routes.list, payload);
  return data;
}

export async function updateRoute(id: number, payload: ApiRouteUpdate): Promise<ApiRoute> {
  const { data } = await api.patch<ApiRoute>(API_ENDPOINTS.routes.detail(id), payload);
  return data;
}

export async function deleteRoute(id: number): Promise<void> {
  await api.delete(API_ENDPOINTS.routes.detail(id));
}
