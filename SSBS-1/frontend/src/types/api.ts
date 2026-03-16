export type Lang     = 'en' | 'fr' | 'ar'
export type UserRole = 'STUDENT' | 'LOGISTICS_STAFF' | 'DRIVER'
export type RouteWindow = 'peak' | 'consolidated'
export type DriverStatus = 'active' | 'inactive'

export interface User {
  id:           string
  login_42:     string
  email:        string
  role:         UserRole
  station:      string | null
  station_name: string | null
  is_active:    boolean
  created_at:   string
}

export interface Station {
  id: string
  name: string
  created_at: string
}

export interface StationCreate {
  name: string
}

export type StationUpdate = Partial<StationCreate>

export interface Bus {
  id: string
  name: string
  plate: string
  seat_capacity: number
  created_at: string
}

export interface RouteStation {
  order: number
  station: Station
}

export interface Route {
  id: string
  name: string
  window: RouteWindow
  created_at: string
  stations: RouteStation[]
}

export interface Driver {
  id: string
  name: string
  username: string
  status: DriverStatus
  created_at: string
}

export interface Trip {
  id: string
  route: string
  route_name: string
  bus: string
  bus_name: string
  driver: string
  departure_datetime: string
  seats_left: number
  archived_at: string | null
  created_at: string
}

export interface Reservation {
  id: string
  trip: string
  trip_details: Trip | null
  student: string
  created_at: string
}

export interface Report {
  id: string
  reporter: string
  trip: string | null
  report_type: string
  description: string
  created_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  target_role: string | null
  created_at: string
  is_read: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
  user: User
}

export interface ApiError {
  error?: string
  code?: string
  detail?: string
  [key: string]: unknown
}

export interface DrfValidationErrors {
  [field: string]: string[] | string | undefined
}

export interface LoginUrlResponse {
  authorization_url: string
}

export interface AccessTokenResponse {
  access: string
  refresh?: string
}

export interface BusCreate {
  name: string
  plate: string
  seat_capacity: number
}

export type BusUpdate = Partial<BusCreate>

export interface RouteWritePayload {
  name: string
  window: RouteWindow
  station_ids: string[]
}

export type RouteUpdatePayload = Partial<RouteWritePayload>

export type ApiRoute = Route
export type ApiRouteCreate = RouteWritePayload
export type ApiRouteUpdate = RouteUpdatePayload

export interface DriverCreate {
  name: string
  username: string
  password: string
  status?: DriverStatus
}

export type DriverUpdate = Partial<DriverCreate>

export interface TripCreate {
  route: string
  bus: string
  driver: string
  departure_datetime: string
}

export type TripUpdate = Partial<TripCreate>

export interface ReservationCreate {
  trip: string
}

export interface ReportCreate {
  trip?: string | null
  report_type: string
  description: string
}

export type ReportUpdate = Partial<ReportCreate>

export interface UserUpdate {
  station?: string | null
  role?: UserRole
  is_active?: boolean
}

export type UserCreate = UserUpdate & {
  email: string
  login_42?: string
}

export type ApiErrorCode =
  | 'lifecycle_error'
  | 'freeze_error'
  | 'capacity_error'
  | 'integrity_error'
  | 'domain_error'

export interface Organization {
  id: number
  name: string
}

export interface OrganizationCreate {
  name: string
}
