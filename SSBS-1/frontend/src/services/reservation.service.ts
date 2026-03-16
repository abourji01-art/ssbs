// @ts-nocheck
// ── Reservation service ──

import api from '../lib/axios';
import { API_ENDPOINTS } from '../config/api.config';
import type { Reservation, ReservationCreate } from '../types/api';

export async function getReservations(): Promise<Reservation[]> {
  const { data } = await api.get<Reservation[]>(API_ENDPOINTS.reservations.list);
  return data;
}

export async function getReservation(id: number): Promise<Reservation> {
  const { data } = await api.get<Reservation>(API_ENDPOINTS.reservations.detail(id));
  return data;
}

export async function createReservation(payload: ReservationCreate): Promise<Reservation> {
  const { data } = await api.post<Reservation>(API_ENDPOINTS.reservations.list, payload);
  return data;
}

export async function cancelReservation(id: number): Promise<void> {
  await api.delete(API_ENDPOINTS.reservations.detail(id));
}
