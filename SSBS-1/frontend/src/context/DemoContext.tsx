// ── Demo mode context ──
// Provides a read-only demo flag and seeds React Query with mock
// data so the admin dashboard can be explored without a backend.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DEMO_BUSES, DEMO_DRIVERS, DEMO_ROUTES, DEMO_STATIONS, DEMO_TRIPS } from '../demo/data'
import { queryKeys } from '../hooks/useApi'

const DEMO_KEY = 'fleetmark_demo'

interface DemoState {
  isDemo: boolean
}

const DemoContext = createContext<DemoState>({ isDemo: false })

/** Check whether demo mode is active (localStorage flag). */
export function isDemoMode(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === '1'
  } catch {
    return false
  }
}

/** Activate demo mode — seeds auth + sets flag. */
export function activateDemo(): void {
  localStorage.setItem(DEMO_KEY, '1')
  localStorage.setItem('fleetmark_access', 'demo-token')
  localStorage.setItem('fleetmark_refresh', 'demo-refresh')
  localStorage.setItem(
    'fleetmark_user',
    JSON.stringify({
      id: 'demo-user',
      login_42: 'demo_admin',
      email: 'demo@1337.ma',
      role: 'LOGISTICS_STAFF',
      station: null,
      station_name: null,
      is_active: true,
      created_at: new Date().toISOString(),
    }),
  )
}

/** Deactivate demo mode and clear the seeded session. */
export function deactivateDemo(): void {
  localStorage.removeItem(DEMO_KEY)
  localStorage.removeItem('fleetmark_access')
  localStorage.removeItem('fleetmark_refresh')
  localStorage.removeItem('fleetmark_user')
  window.dispatchEvent(new CustomEvent('fleetmark-auth-changed'))
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const isDemo = isDemoMode()
  const queryClient = useQueryClient()

  // Seed React Query cache with mock data when in demo mode.
  // Also prevent background refetching so the mock data persists.
  useEffect(() => {
    if (!isDemo) return

    queryClient.setDefaultOptions({
      queries: {
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
      },
    })

    queryClient.setQueryData(queryKeys.buses, DEMO_BUSES)
    queryClient.setQueryData(queryKeys.routes, DEMO_ROUTES)
    queryClient.setQueryData(queryKeys.trips, DEMO_TRIPS)
    queryClient.setQueryData(['drivers'], DEMO_DRIVERS)
    queryClient.setQueryData(['stations'], DEMO_STATIONS)
    queryClient.setQueryData(queryKeys.reservations, [])
    queryClient.setQueryData(queryKeys.reports, [])
    queryClient.setQueryData(queryKeys.notifications, [])
    queryClient.setQueryData(queryKeys.users, [])
  }, [isDemo, queryClient])

  const value = useMemo<DemoState>(() => ({ isDemo }), [isDemo])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoState {
  return useContext(DemoContext)
}
