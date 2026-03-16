import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthTokens, User, UserRole } from '../types/api'
import {
  clearStoredSession,
  getMe,
  getStoredRefreshToken,
  getStoredToken,
  getStoredUser,
  storeAuthTokens,
  storeUser,
} from '../services/api'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isStudent: boolean
  isStaff: boolean
  isDriver: boolean
  login: (tokens: AuthTokens) => void
  logout: () => void
  setUser: (user: User | null) => void
  refreshUser: () => Promise<User | null>
  getDashboardPath: (role: UserRole | string) => string
  getDefaultRouteForUser: (user: User) => string
}

const AuthContext = createContext<AuthState | null>(null)

export function getDashboardPath(role: UserRole | string): string {
  switch (role) {
    case 'LOGISTICS_STAFF':
      return '/admin/overview'
    case 'DRIVER':
      return '/driver'
    default:
      return '/student/overview'
  }
}

export function getDefaultRouteForUser(user: User): string {
  if (user.role === 'STUDENT') {
    return user.station ? '/student/overview' : '/onboarding'
  }

  return getDashboardPath(user.role)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      const hasAccess = !!getStoredToken()
      const hasRefresh = !!getStoredRefreshToken()

      if (!hasAccess && !hasRefresh) {
        if (active) {
          setUserState(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const me = await getMe()
        if (active) {
          setUserState(me)
        }
      } catch {
        clearStoredSession()
        if (active) {
          setUserState(null)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void restoreSession()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const syncAuthState = () => {
      setUserState(getStoredUser())
    }

    window.addEventListener('storage', syncAuthState)
    window.addEventListener('fleetmark-auth-changed', syncAuthState)

    return () => {
      window.removeEventListener('storage', syncAuthState)
      window.removeEventListener('fleetmark-auth-changed', syncAuthState)
    }
  }, [])

  function login(tokens: AuthTokens) {
    storeAuthTokens(tokens)
    storeUser(tokens.user)
    setUserState(tokens.user)
  }

  function logout() {
    clearStoredSession()
    setUserState(null)
    window.location.href = '/'
  }

  function setUser(userValue: User | null) {
    storeUser(userValue)
    setUserState(userValue)
  }

  async function refreshUser(): Promise<User | null> {
    try {
      const me = await getMe()
      setUserState(me)
      return me
    } catch {
      clearStoredSession()
      setUserState(null)
      return null
    }
  }

  const value = useMemo<AuthState>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'STUDENT',
    isStaff: user?.role === 'LOGISTICS_STAFF',
    isDriver: user?.role === 'DRIVER',
    login,
    logout,
    setUser,
    refreshUser,
    getDashboardPath,
    getDefaultRouteForUser,
  }), [isLoading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
