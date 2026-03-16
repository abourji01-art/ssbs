import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { User, UserRole } from '../types/api'
import Spinner from '../components/ui/Spinner'

const HYDRATION_RETRY_DELAYS_MS = [400, 1200, 2400]

export default function AuthCallback() {
  const navigate = useNavigate()
  const { login, setUser, getDashboardPath, getDefaultRouteForUser } = useAuth()
  const calledRef = useRef(false)

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      const access = hashParams.get('access')
      const refresh = hashParams.get('refresh')
      const role = hashParams.get('role') as UserRole | null
      const login42 = hashParams.get('login')

      if (!access || !refresh) {
        navigate('/?error=auth_failed', { replace: true })
        return
      }

      if (calledRef.current) return
      calledRef.current = true

      if (role) {
        const provisionalUser: User = {
          id: 'pending-session',
          login_42: login42 ?? '',
          email: '',
          role,
          station: null,
          station_name: null,
          is_active: true,
          created_at: new Date().toISOString(),
        }

        login({ access, refresh, user: provisionalUser })
        navigate(getDashboardPath(role), { replace: true })
      }

      void hydrateSession(access, refresh)
    }

    handleAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <Spinner text="Signing you in…" />

  async function hydrateSession(access: string, refresh: string) {
    for (const delay of [0, ...HYDRATION_RETRY_DELAYS_MS]) {
      if (delay > 0) {
        await wait(delay)
      }

      try {
        const user = await getMe()
        login({ access, refresh, user })
        setUser(user)
        navigate(getDefaultRouteForUser(user), { replace: true })
        return
      } catch (error) {
        console.error('Session hydration attempt failed:', error)
      }
    }

    navigate('/?error=auth_failed', { replace: true })
  }
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
