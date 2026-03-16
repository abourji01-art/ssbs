import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin/overview',      icon: '📊', label: 'Overview' },
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

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: 'var(--fm-bg)',
      fontFamily: "'Geist', sans-serif",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--fm-surface)',
        borderRight: '1px solid var(--fm-line)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 0',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{
          padding: '0 20px 20px',
          fontSize: 15, fontWeight: 800, color: 'var(--fm-ink)',
          textDecoration: 'none', letterSpacing: '-0.02em',
          borderBottom: '1px solid var(--fm-line)',
          marginBottom: 12,
        }}>
          FLEETMARK
          <span style={{
            display: 'block', fontSize: 10, fontWeight: 500,
            color: 'var(--fm-dim)', marginTop: 2,
          }}>Admin Panel</span>
        </NavLink>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fm-ink)', marginBottom: 2 }}>
            {user?.login_42 ?? user?.email ?? '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fm-dim)', marginBottom: 10 }}>
            Logistics Staff
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%', padding: '8px 0', borderRadius: 6,
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
      <main style={{ flex: 1, padding: 28, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
