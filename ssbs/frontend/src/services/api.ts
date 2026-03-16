import { API_URL, STORAGE_KEYS } from '../config'
import type {
  User, Station, Bus, Route, Driver,
  Trip, Reservation, AuthTokens
} from '../types/api'

// ── STORAGE HELPERS ──────────────────────────────────

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function logout(): void {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
  window.location.href = '/'
}

// ── FETCH WRAPPER ─────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (auth) {
    const token = getStoredToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (res.status === 401) { logout(); throw new Error('Unauthorized') }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw err
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── AUTH ──────────────────────────────────────────────

export async function getLoginUrl(): Promise<{ authorization_url: string }> {
  return request('/auth/42/login/', {}, false)
}

export async function devLogin(payload: { email?: string; login_42?: string }): Promise<AuthTokens> {
  const data = await request<AuthTokens>(
    '/auth/dev-login/',
    { method: 'POST', body: JSON.stringify(payload) },
    false
  )
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  data.access)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
  return data
}

export async function handleOAuthCallback(code: string): Promise<AuthTokens> {
  const data = await request<AuthTokens>(
    `/auth/42/callback/?code=${code}`, {}, false
  )
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  data.access)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
  return data
}

export async function refreshAccessToken(): Promise<{ access: string }> {
  const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  return request('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  }, false)
}

export async function getMe(): Promise<User> {
  return request('/auth/me/')
}

export async function patchMe(data: { station: string | null }): Promise<User> {
  return request('/auth/me/', { method: 'PATCH', body: JSON.stringify(data) })
}

export async function getUsers(): Promise<User[]> {
  return request('/auth/users/')
}

// ── STATIONS ──────────────────────────────────────────

export async function getStations(): Promise<Station[]> {
  return request('/stations/')
}

// ── BUSES ─────────────────────────────────────────────

export async function getBuses(): Promise<Bus[]> {
  return request('/buses/')
}

// ── ROUTES ────────────────────────────────────────────

export async function getRoutes(): Promise<Route[]> {
  return request('/routes/')
}

// ── DRIVERS ───────────────────────────────────────────

export async function getDrivers(): Promise<Driver[]> {
  return request('/drivers/')
}

// ── TRIPS ─────────────────────────────────────────────

export async function getTrips(): Promise<Trip[]> {
  return request('/trips/')
}

export async function getAvailableTrips(stationId: string): Promise<Trip[]> {
  return request(`/trips/available/?station_id=${stationId}`)
}

// ── RESERVATIONS ──────────────────────────────────────

export async function getReservations(userId: string): Promise<Reservation[]> {
  return request(`/reservations/?user_id=${userId}`)
}

export async function getReservationHistory(userId: string): Promise<Reservation[]> {
  return request(`/reservations/history/?user_id=${userId}`)
}

export async function createReservation(
  tripId: string, userId: string
): Promise<Reservation> {
  return request('/reservations/', {
    method: 'POST',
    body: JSON.stringify({ trip: tripId, user_id: userId }),
  })
}

export async function cancelReservation(
  reservationId: string, userId: string
): Promise<void> {
  return request(
    `/reservations/${reservationId}/?user_id=${userId}`,
    { method: 'DELETE' }
  )
}
