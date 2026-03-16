import { AxiosError } from 'axios'
import { STORAGE_KEYS } from '../config'
import { API_ENDPOINTS } from '../config/api.config'
import api, { rawApi } from '../lib/axios'
import type {
  AccessTokenResponse,
  AuthTokens,
  Bus,
  BusCreate,
  BusUpdate,
  Driver,
  DriverCreate,
  DriverUpdate,
  LoginUrlResponse,
  Notification,
  Reservation,
  Route,
  RouteWritePayload,
  RouteUpdatePayload,
  Station,
  StationCreate,
  StationUpdate,
  Trip,
  TripCreate,
  TripUpdate,
  User,
} from '../types/api'

function notifyAuthChange() {
  window.dispatchEvent(new CustomEvent('fleetmark-auth-changed'))
}

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function storeAuthTokens(tokens: Pick<AuthTokens, 'access' | 'refresh'>): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh)
  notifyAuthChange()
}

export function storeUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
  notifyAuthChange()
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  notifyAuthChange()
}

export function logout(): void {
  clearStoredSession()
  window.location.href = '/'
}

export async function getLoginUrl(): Promise<LoginUrlResponse> {
  const { data } = await rawApi.get<LoginUrlResponse>(API_ENDPOINTS.auth.login42)
  return data
}

export async function refreshAccessToken(): Promise<AccessTokenResponse> {
  const refresh = getStoredRefreshToken()

  if (!refresh) {
    throw new Error('No refresh token available.')
  }

  const { data } = await rawApi.post<AccessTokenResponse>(API_ENDPOINTS.auth.refresh, { refresh })
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access)

  if (data.refresh) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh)
  }

  notifyAuthChange()
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>(API_ENDPOINTS.auth.me)
  storeUser(data)
  return data
}

export async function establishSession(tokens: Pick<AuthTokens, 'access' | 'refresh'>): Promise<AuthTokens> {
  storeAuthTokens(tokens)

  try {
    const user = await getMe()
    return { ...tokens, user }
  } catch (error) {
    clearStoredSession()
    throw error
  }
}

export async function patchMe(data: { station: string | null }): Promise<User> {
  const response = await api.patch<User>(API_ENDPOINTS.auth.me, data)
  storeUser(response.data)
  return response.data
}

export async function getStations(): Promise<Station[]> {
  const { data } = await api.get<Station[]>(API_ENDPOINTS.stations.list)
  return data
}

export async function getStation(stationId: string): Promise<Station> {
  const { data } = await api.get<Station>(API_ENDPOINTS.stations.detail(stationId))
  return data
}

export async function createStation(payload: StationCreate): Promise<Station> {
  const { data } = await api.post<Station>(API_ENDPOINTS.stations.list, payload)
  return data
}

export async function updateStation(stationId: string, payload: StationUpdate): Promise<Station> {
  const { data } = await api.patch<Station>(API_ENDPOINTS.stations.detail(stationId), payload)
  return data
}

export async function deleteStation(stationId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.stations.detail(stationId))
}

export async function getBuses(): Promise<Bus[]> {
  const { data } = await api.get<Bus[]>(API_ENDPOINTS.buses.list)
  return data
}

export async function getBus(busId: string): Promise<Bus> {
  const { data } = await api.get<Bus>(API_ENDPOINTS.buses.detail(busId))
  return data
}

export async function createBus(payload: BusCreate): Promise<Bus> {
  const { data } = await api.post<Bus>(API_ENDPOINTS.buses.list, payload)
  return data
}

export async function updateBus(busId: string, payload: BusUpdate): Promise<Bus> {
  const { data } = await api.patch<Bus>(API_ENDPOINTS.buses.detail(busId), payload)
  return data
}

export async function deleteBus(busId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.buses.detail(busId))
}

export async function getRoutes(): Promise<Route[]> {
  const { data } = await api.get<Route[]>(API_ENDPOINTS.routes.list)
  return data
}

export async function getRoute(routeId: string): Promise<Route> {
  const { data } = await api.get<Route>(API_ENDPOINTS.routes.detail(routeId))
  return data
}

export async function createRoute(payload: RouteWritePayload): Promise<Route> {
  const { data } = await api.post<Route>(API_ENDPOINTS.routes.list, payload)
  return data
}

export async function updateRoute(routeId: string, payload: RouteUpdatePayload): Promise<Route> {
  const { data } = await api.patch<Route>(API_ENDPOINTS.routes.detail(routeId), payload)
  return data
}

export async function deleteRoute(routeId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.routes.detail(routeId))
}

export async function getDrivers(): Promise<Driver[]> {
  const { data } = await api.get<Driver[]>(API_ENDPOINTS.drivers.list)
  return data
}

export async function getDriver(driverId: string): Promise<Driver> {
  const { data } = await api.get<Driver>(API_ENDPOINTS.drivers.detail(driverId))
  return data
}

export async function createDriver(payload: DriverCreate): Promise<Driver> {
  const { data } = await api.post<Driver>(API_ENDPOINTS.drivers.list, payload)
  return data
}

export async function updateDriver(driverId: string, payload: DriverUpdate): Promise<Driver> {
  const { data } = await api.patch<Driver>(API_ENDPOINTS.drivers.detail(driverId), payload)
  return data
}

export async function deleteDriver(driverId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.drivers.detail(driverId))
}

export async function getTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>(API_ENDPOINTS.trips.list)
  return data
}

export async function createTrip(payload: TripCreate): Promise<Trip> {
  const { data } = await api.post<Trip>(API_ENDPOINTS.trips.list, payload)
  return data
}

export async function updateTrip(tripId: string, payload: TripUpdate): Promise<Trip> {
  const { data } = await api.patch<Trip>(API_ENDPOINTS.trips.detail(tripId), payload)
  return data
}

export async function deleteTrip(tripId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.trips.detail(tripId))
}

export async function getAvailableTrips(stationId: string): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>(API_ENDPOINTS.trips.available, {
    params: { station_id: stationId },
  })
  return data
}

export async function getReservations(_userId?: string): Promise<Reservation[]> {
  const { data } = await api.get<Reservation[]>(API_ENDPOINTS.reservations.list)
  return data
}

export async function getReservationHistory(_userId?: string): Promise<Reservation[]> {
  const { data } = await api.get<Reservation[]>(API_ENDPOINTS.reservations.history)
  return data
}

export async function createReservation(tripId: string, _userId?: string): Promise<Reservation> {
  const { data } = await api.post<Reservation>(API_ENDPOINTS.reservations.list, { trip: tripId })
  return data
}

export async function cancelReservation(reservationId: string, _userId?: string): Promise<void> {
  await api.delete(API_ENDPOINTS.reservations.detail(reservationId))
}

export async function getNotifications(): Promise<Notification[]> {
  return []
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401
}
