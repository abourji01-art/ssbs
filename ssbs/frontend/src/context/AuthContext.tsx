import { createContext, useContext, useEffect, useState } from 'react'
import type { User, AuthTokens } from '../types/api'
import { STORAGE_KEYS } from '../config'

interface AuthState {
  user:            User | null
  isLoading:       boolean
  isAuthenticated: boolean
  isStudent:       boolean
  isStaff:         boolean
  isDriver:        boolean
  login:           (tokens: AuthTokens) => void
  logout:          () => void
  getDashboardPath:(role: string) => string
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER)
      if (raw) setUser(JSON.parse(raw) as User)
    } catch { /* ignore */ }
    setIsLoading(false)
  }, [])

  function login(tokens: AuthTokens) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  tokens.access)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(tokens.user))
    setUser(tokens.user)
  }

  function logout() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
    setUser(null)
    window.location.href = '/'
  }

  function getDashboardPath(role: string): string {
    switch (role) {
      case 'LOGISTICS_STAFF': return '/admin/overview'
      case 'DRIVER':          return '/driver'
      default:                return '/student/overview'
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      isStudent:       user?.role === 'STUDENT',
      isStaff:         user?.role === 'LOGISTICS_STAFF',
      isDriver:        user?.role === 'DRIVER',
      login,
      logout,
      getDashboardPath,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
