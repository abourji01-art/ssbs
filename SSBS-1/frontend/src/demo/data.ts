// ── Demo / preview mock data ──
// Used when the app is launched in demo mode so the admin pages
// can be explored without a running backend.

import type { Bus, Driver, Route, Station, Trip } from '../types/api'

const now = new Date()
const ts = (d: number, h: number) => {
  const dt = new Date(now)
  dt.setDate(dt.getDate() + d)
  dt.setHours(h, 0, 0, 0)
  return dt.toISOString()
}

export const DEMO_STATIONS: Station[] = [
  { id: 's1', name: 'OCP Saka',    created_at: ts(-30, 10) },
  { id: 's2', name: 'Nakhil',      created_at: ts(-30, 10) },
  { id: 's3', name: 'Kentra',      created_at: ts(-29, 14) },
  { id: 's4', name: 'La Gare',     created_at: ts(-28, 9)  },
  { id: 's5', name: 'Hay Salam',   created_at: ts(-27, 11) },
  { id: 's6', name: '1337 Campus', created_at: ts(-27, 11) },
]

export const DEMO_BUSES: Bus[] = [
  { id: 'b1', name: 'Night Shuttle A', plate: 'MA-1234-A', seat_capacity: 44, created_at: ts(-20, 8) },
  { id: 'b2', name: 'Night Shuttle B', plate: 'MA-5678-B', seat_capacity: 32, created_at: ts(-18, 9) },
  { id: 'b3', name: 'Express C',       plate: 'MA-9012-C', seat_capacity: 28, created_at: ts(-10, 10) },
]

export const DEMO_ROUTES: Route[] = [
  {
    id: 'r1', name: 'Route A – Peak', window: 'peak', created_at: ts(-15, 10),
    stations: [
      { order: 1, station: DEMO_STATIONS[0] },
      { order: 2, station: DEMO_STATIONS[1] },
      { order: 3, station: DEMO_STATIONS[2] },
      { order: 4, station: DEMO_STATIONS[3] },
    ],
  },
  {
    id: 'r2', name: 'Route B – Peak', window: 'peak', created_at: ts(-14, 11),
    stations: [
      { order: 1, station: DEMO_STATIONS[3] },
      { order: 2, station: DEMO_STATIONS[4] },
      { order: 3, station: DEMO_STATIONS[5] },
    ],
  },
  {
    id: 'r3', name: 'Consolidated Run', window: 'consolidated', created_at: ts(-12, 9),
    stations: [
      { order: 1, station: DEMO_STATIONS[0] },
      { order: 2, station: DEMO_STATIONS[1] },
      { order: 3, station: DEMO_STATIONS[2] },
      { order: 4, station: DEMO_STATIONS[3] },
      { order: 5, station: DEMO_STATIONS[4] },
      { order: 6, station: DEMO_STATIONS[5] },
    ],
  },
]

export const DEMO_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Ahmed Benali',     username: 'abenali',   status: 'active',   created_at: ts(-20, 8) },
  { id: 'd2', name: 'Youssef Tazi',     username: 'ytazi',     status: 'active',   created_at: ts(-18, 9) },
  { id: 'd3', name: 'Rachid El Amrani', username: 'relamrani', status: 'inactive', created_at: ts(-10, 10) },
]

export const DEMO_TRIPS: Trip[] = [
  { id: 't1', route: 'r1', bus: 'b1', driver: 'd1', departure_datetime: ts(0, 22), seats_left: 12, archived_at: null, created_at: ts(-2, 14) },
  { id: 't2', route: 'r2', bus: 'b2', driver: 'd2', departure_datetime: ts(0, 22), seats_left: 3,  archived_at: null, created_at: ts(-2, 14) },
  { id: 't3', route: 'r3', bus: 'b3', driver: 'd1', departure_datetime: ts(0, 1),  seats_left: 0,  archived_at: null, created_at: ts(-2, 14) },
  { id: 't4', route: 'r1', bus: 'b1', driver: 'd2', departure_datetime: ts(-1, 22), seats_left: 0, archived_at: ts(-1, 6), created_at: ts(-3, 14) },
]
