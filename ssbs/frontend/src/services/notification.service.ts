import api from '../lib/axios';
import type { Notification } from '../types/api';

export async function getNotifications(userId?: string): Promise<Notification[]> {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  const { data } = await api.get<Notification[]>(`/notifications/${query}`);
  return data;
}

export async function createNotification(payload: { title: string; message: string; target_role: string | null }): Promise<Notification> {
  const { data } = await api.post<Notification>('/notifications/', payload);
  return data;
}
