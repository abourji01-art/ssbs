import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

import Landing      from './pages/Landing'
import AuthCallback from './pages/AuthCallback'
import NotFound     from './pages/NotFound'

import AdminLayout       from './components/layout/AdminLayout'
import AdminOverview     from './pages/admin/Overview'
import AdminStations     from './pages/admin/Stations'
import AdminBuses        from './pages/admin/Buses'
import AdminRoutes       from './pages/admin/Routes'
import AdminTrips        from './pages/admin/Trips'
import AdminReservations from './pages/admin/Reservations'
import AdminDrivers      from './pages/admin/Drivers'
import AdminStudents     from './pages/admin/Students'
import AdminSettings     from './pages/admin/Settings'

import StudentLayout     from './pages/student/StudentLayout'
import StudentOverview   from './pages/student/Overview'
import StudentReserve    from './pages/student/Reserve'
import StudentHistory    from './pages/student/History'
import StudentOnboarding from './pages/student/Onboarding'
import StudentSettings   from './pages/student/Settings'

import DriverComingSoon  from './pages/driver/ComingSoon'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><Navigate to="overview" replace /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/overview" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><AdminOverview /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/stations" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><AdminStations /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/buses" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><AdminBuses /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/routes" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><AdminRoutes /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/trips" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><AdminTrips /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/reservations" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><AdminReservations /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/drivers" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><AdminDrivers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><AdminStudents /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute role="LOGISTICS_STAFF"><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />

            {/* Student */}
            <Route element={<ProtectedRoute role="STUDENT"><StudentLayout /></ProtectedRoute>}>
              <Route path="/student" element={<Navigate to="/student/overview" replace />} />
              <Route path="/student/overview" element={<StudentOverview />} />
              <Route path="/student/reserve" element={<StudentReserve />} />
              <Route path="/student/history" element={<StudentHistory />} />
              <Route path="/student/settings" element={<StudentSettings />} />
              <Route path="/onboarding" element={<StudentOnboarding />} />
            </Route>

            {/* Driver */}
            <Route path="/driver" element={<ProtectedRoute role="DRIVER"><DriverComingSoon /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
    </QueryClientProvider>
  )
}
