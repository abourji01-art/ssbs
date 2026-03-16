import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/api'
import Spinner from '../ui/Spinner'

const ROLE_HOME: Record<UserRole, string> = {
  STUDENT:         '/student',
  LOGISTICS_STAFF: '/admin',
  DRIVER:          '/driver',
}

interface Props {
  role: UserRole
  children: React.ReactNode
}

export default function ProtectedRoute({ role, children }: Props) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (user?.role !== role) return <Navigate to={ROLE_HOME[user!.role]} replace />

  return <>{children}</>
}
