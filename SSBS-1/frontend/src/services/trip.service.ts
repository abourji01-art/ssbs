// @ts-nocheck
// ── Trip service — CRUD ──

import api from '../lib/axios';
import { API_ENDPOINTS } from '../config/api.config';
import type { Trip, TripCreate, TripUpdate } from '../types/api';

export async function getTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>(API_ENDPOINTS.trips.list);
  return data;
}

export async function getTrip(id: string): Promise<Trip> {
  const { data } = await api.get<Trip>(API_ENDPOINTS.trips.detail(id));
  return data;
}

export async function createTrip(payload: TripCreate): Promise<Trip> {
  const { data } = await api.post<Trip>(API_ENDPOINTS.trips.list, payload);
  return data;
}

export async function updateTrip(id: string, payload: TripUpdate): Promise<Trip> {
  const { data } = await api.patch<Trip>(API_ENDPOINTS.trips.detail(id), payload);
  return data;
}

export async function deleteTrip(id: string): Promise<void> {
  await api.delete(API_ENDPOINTS.trips.detail(id));
}
