import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin/overview',      icon: '📊', label: 'Overview' },
  { to: '/admin/stations',      icon: '📍', label: 'Stations' },
  { to: '/admin/buses',         icon: '🚌', label: 'Buses' },
  { to: '/admin/routes',        icon: '🗺️', label: 'Routes' },
  { to: '/admin/reservations',  icon: '🎫', label: 'Reservations' },
  { to: '/admin/drivers',       icon: '🧑‍✈️', label: 'Drivers' },
  { to: '/admin/students',      icon: '🎓', label: 'Students' },
  { to: '/admin/settings',      icon: '⚙️', label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const updateLayout = () => {
      setIsCompact(window.innerWidth < 1100)
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: isCompact ? 'column' : 'row',
      minHeight: '100vh',
      background: 'var(--fm-bg)',
      fontFamily: "'Geist', sans-serif",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: isCompact ? '100%' : 220,
        flexShrink: 0,
        background: 'var(--fm-surface)',
        borderRight: isCompact ? 'none' : '1px solid var(--fm-line)',
        borderBottom: isCompact ? '1px solid var(--fm-line)' : 'none',
        display: 'flex', flexDirection: 'column',
        padding: '20px 0',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{
          padding: '0 20px 20px',
          fontSize: 15, fontWeight: 800, color: 'var(--fm-ink)',
          textDecoration: 'none', letterSpacing: '-0.02em',
          borderBottom: isCompact ? 'none' : '1px solid var(--fm-line)',
          marginBottom: isCompact ? 8 : 12,
        }}>
          FLEETMARK
          <span style={{
            display: 'block', fontSize: 10, fontWeight: 500,
            color: 'var(--fm-dim)', marginTop: 2,
          }}>Admin Panel</span>
        </NavLink>

        {/* Nav links */}
        <nav style={{
          flex: 1,
          padding: '8px 10px',
          display: 'flex',
          flexDirection: isCompact ? 'row' : 'column',
          gap: 8,
          overflowX: isCompact ? 'auto' : 'visible',
        }}>
          {NAV.map(n => {
            const active = loc.pathname === n.to || (n.to === '/admin/overview' && loc.pathname === '/admin')
            return (
              <NavLink
                key={n.to}
                to={n.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--fm-blue)' : 'var(--fm-mid)',
                  background: active ? 'var(--fm-blue-bg)' : 'transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 15 }}>{n.icon}</span>
                {n.label}
              </NavLink>
            )
          })}
        </nav>

        {/* User info + Sign out */}
        <div style={{
          padding: '12px 14px', margin: '0 10px',
          borderTop: '1px solid var(--fm-line)',
          display: 'flex',
          flexDirection: isCompact ? 'row' : 'column',
          alignItems: isCompact ? 'center' : 'stretch',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fm-ink)', marginBottom: 2 }}>
              {user?.login_42 ?? user?.email ?? '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fm-dim)' }}>
              Logistics Staff
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: isCompact ? 'auto' : '100%',
              minWidth: isCompact ? 110 : undefined,
              padding: '8px 16px', borderRadius: 6,
              border: '1px solid var(--fm-line)', background: 'transparent',
              color: 'var(--fm-mid)', fontSize: 12, fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: isCompact ? 16 : 28, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
