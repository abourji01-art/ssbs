import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { handleOAuthCallback } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { STORAGE_KEYS } from '../config'
import Spinner from '../components/ui/Spinner'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { login } = useAuth()
  const calledRef = useRef(false)

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Try to get tokens from hash (backend redirect method)
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      const access = hashParams.get('access')
      const refresh = hashParams.get('refresh')

      if (access && refresh) {
        if (calledRef.current) return
        calledRef.current = true
        
        try {
          // Store tokens temporarily to allow getMe() to work
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access)
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
          
          const user = await import('../services/api').then(m => m.getMe())
          login({ access, refresh, user })
          
          const r = user.role
          if (r === 'LOGISTICS_STAFF') navigate('/admin')
          else if (r === 'STUDENT') navigate(user.station ? '/student' : '/onboarding')
          else if (r === 'DRIVER') navigate('/driver')
          else navigate('/')
        } catch (error) {
          console.error('Hash auth failed:', error)
          navigate('/?error=auth_failed')
        }
        return
      }

      // 2. Fallback: Try to get code from query params
      const code = params.get('code')
      if (!code) {
        navigate('/')
        return
      }

      if (calledRef.current) return
      calledRef.current = true

      try {
        const tokens = await handleOAuthCallback(code)
        login(tokens)
        const r = tokens.user.role
        if (r === 'LOGISTICS_STAFF') navigate('/admin')
        else if (r === 'STUDENT') navigate(tokens.user.station ? '/student' : '/onboarding')
        else if (r === 'DRIVER') navigate('/driver')
        else navigate('/')
      } catch (error) {
        console.error('Code auth failed:', error)
        navigate('/?error=auth_failed')
      }
    }

    handleAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <Spinner text="Signing you in…" />
}
