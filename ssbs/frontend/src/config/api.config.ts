// @ts-nocheck
// ── API endpoint configuration — single source of truth ──

const BASE = '/api/v1';

export const API_ENDPOINTS = {
  // ── Auth ──
  auth: {
    token: `${BASE}/auth/token/`,
    refresh: `${BASE}/auth/token/refresh/`,
    verify: `${BASE}/auth/token/verify/`,
    oauth42Callback: `${BASE}/auth/42/callback/`,
    setRole: `${BASE}/auth/set-role/`,
  },

  // ── Users ──
  users: {
    list: `${BASE}/auth/users/`,
    detail: (id: number) => `${BASE}/auth/users/${id}/`,
  },

  // ── Buses ──
  buses: {
    list: `${BASE}/buses/`,
    detail: (id: number) => `${BASE}/buses/${id}/`,
  },

  // ── Routes ──
  routes: {
    list: `${BASE}/routes/`,
    detail: (id: number) => `${BASE}/routes/${id}/`,
  },

  // ── Trips ──
  trips: {
    list: `${BASE}/trips/`,
    detail: (id: number) => `${BASE}/trips/${id}/`,
    start: (id: number) => `${BASE}/trips/${id}/start/`,
    end: (id: number) => `${BASE}/trips/${id}/end/`,
  },

  // ── Reservations ──
  reservations: {
    list: `${BASE}/reservations/`,
    detail: (id: number) => `${BASE}/reservations/${id}/`,
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
