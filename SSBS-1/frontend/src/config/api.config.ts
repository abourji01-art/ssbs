// @ts-nocheck
// ── API endpoint configuration — single source of truth ──

const BASE = '/api/v1';

export const API_ENDPOINTS = {
  // ── Auth ──
  auth: {
    login42: `${BASE}/auth/42/login/`,
    callback42: `${BASE}/auth/42/callback/`,
    refresh: `${BASE}/auth/token/refresh/`,
    me: `${BASE}/auth/me/`,
  },

  // ── Users ──
  users: {
    list: `${BASE}/auth/users/`,
    detail: (id: number | string) => `${BASE}/auth/users/${id}/`,
  },

  // ── Stations ──
  stations: {
    list: `${BASE}/stations/`,
    detail: (id: number | string) => `${BASE}/stations/${id}/`,
  },

  // ── Buses ──
  buses: {
    list: `${BASE}/buses/`,
    detail: (id: number | string) => `${BASE}/buses/${id}/`,
  },

  // ── Routes ──
  routes: {
    list: `${BASE}/routes/`,
    detail: (id: number | string) => `${BASE}/routes/${id}/`,
  },

  // ── Drivers ──
  drivers: {
    list: `${BASE}/drivers/`,
    detail: (id: number | string) => `${BASE}/drivers/${id}/`,
  },

  // ── Trips ──
  trips: {
    list: `${BASE}/trips/`,
    detail: (id: number | string) => `${BASE}/trips/${id}/`,
    available: `${BASE}/trips/available/`,
  },

  // ── Reservations ──
  reservations: {
    list: `${BASE}/reservations/`,
    history: `${BASE}/reservations/history/`,
    detail: (id: number | string) => `${BASE}/reservations/${id}/`,
  },

  // ── Reports ──
  reports: {
    list: `${BASE}/reports/`,
    detail: (id: number | string) => `${BASE}/reports/${id}/`,
  },

  // ── Notifications ──
  notifications: {
    list: `${BASE}/notifications/`,
    detail: (id: number | string) => `${BASE}/notifications/${id}/`,
  },
} as const;

// ── Storage keys ──
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fleetmark_access',
  REFRESH_TOKEN: 'fleetmark_refresh',
  USER: 'fleetmark_user',
} as const;

// ── Feature flags ──
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const FEATURE_FLAGS = {
  NOTIFICATIONS_ENABLED: import.meta.env.VITE_NOTIFICATIONS_ENABLED === 'true',
  SCHEDULE_ENABLED: import.meta.env.VITE_SCHEDULE_ENABLED === 'true',
  REPORTS_ENABLED: import.meta.env.VITE_REPORTS_ENABLED === 'true',
  STOPS_API_ENABLED: import.meta.env.VITE_STOPS_API_ENABLED === 'true',
} as const;
