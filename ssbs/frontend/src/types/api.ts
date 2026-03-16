export type Lang     = 'en' | 'fr' | 'ar'
export type UserRole = 'STUDENT' | 'LOGISTICS_STAFF' | 'DRIVER'

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

export interface Bus {
  id: string
  name: string
  plate: string
  seat_capacity: number
  created_at: string
}

export type RouteWindow = 'peak' | 'consolidated'

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
  status: 'active' | 'inactive'
  created_at: string
}

export interface Trip {
  id: string
  route: string
  bus: string
  driver: string
  departure_datetime: string
  seats: number
  archived_at: string | null
  status: string
  created_at: string
}

export interface Reservation {
  id: string
  trip: string
  student: string
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
  detail?: string
  [key: string]: unknown
}

