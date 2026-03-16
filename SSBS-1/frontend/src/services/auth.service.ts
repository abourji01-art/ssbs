// @ts-nocheck
// ── Auth service — JWT login, refresh, verify, session restore ──

import axios from 'axios';
import api from '../lib/axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/api.config';
import type { JwtPayload, AuthCallbackResponse } from '../types/api';

// ── Decode JWT payload (no library needed) ──
export function decodeToken(token: string): JwtPayload {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
  return JSON.parse(jsonPayload);
}

// ── Check if token is expired ──
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeToken(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

// ── Refresh access token ──
export async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refresh) throw new Error('No refresh token');

  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || ''}${API_ENDPOINTS.auth.refresh}`,
    { refresh },
  );

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
  if (data.refresh) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
  }

  return data.access;
}

// ── Verify token is still valid ──
export async function verifyToken(token: string): Promise<boolean> {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || ''}${API_ENDPOINTS.auth.verify}`,
      { token },
    );
    return true;
  } catch {
    return false;
  }
}

// ── Logout — clear everything ──
export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// ── 42 OAuth Helpers ──

/** Build the 42 Intra authorization URL */
export function get42AuthUrl(state?: string): string {
  const clientId = import.meta.env.VITE_42_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_42_REDIRECT_URI;
  let url =
    `https://api.intra.42.fr/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=public`;
  if (state) {
    url += `&state=${encodeURIComponent(state)}`;
  }
  return url;
}

/** Exchange 42 authorization code for Fleetmark JWT tokens */
export async function loginWith42Code(code: string): Promise<AuthCallbackResponse> {
  const { data } = await api.post<AuthCallbackResponse>(API_ENDPOINTS.auth.oauth42Callback, { code });

  // Store tokens
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

  return data;
}
