import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReservations } from '../../hooks/useApi';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  emoji: string;
  label: string;
  path: string;
  badge?: string;
  count?: boolean;
}

const NAV: Record<string, NavItem[]> = {
  main: [
    { emoji: '🏠', label: 'Overview', path: '/admin/overview' },
  ],
  transport: [
    { emoji: '🚌', label: 'Buses', path: '/admin/buses' },
    { emoji: '🗺️', label: 'Routes', path: '/admin/routes' },
    { emoji: '🕐', label: 'Trips', path: '/admin/trips' },
  ],
  people: [
    { emoji: '📋', label: 'Reservations', path: '/admin/reservations', count: true },
    { emoji: '🚗', label: 'Drivers', path: '/admin/drivers' },
    { emoji: '👥', label: 'Students', path: '/admin/students' },
  ],
  system: [
    { emoji: '⚙️', label: 'Settings', path: '/admin/settings' },
  ],
};

const V = {
  bg: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  blueBdr: 'var(--fm-blue-bdr)',
  amberBg: 'var(--fm-amber-bg)',
  amber: 'var(--fm-amber)',
  amberBdr: 'var(--fm-amber-bdr)',
} as const;

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) => {
  const { user } = useAuth();
  const { data: reservations = [] } = useReservations();
  const { t } = useTranslation();

  const renderNav = (items: NavItem[]) =>
    items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onMobileClose}
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '8px 10px',
          margin: '1px 6px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? V.blue : V.mid,
          background: isActive ? V.blueBg : 'transparent',
          textDecoration: 'none',
          transition: 'all 0.15s',
          fontFamily: "'Geist', sans-serif",
        })}
      >
        <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.emoji}</span>
        {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
        {!collapsed && item.badge && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            background: V.amberBg, color: V.amber, border: `1px solid ${V.amberBdr}`,
          }}>
            {item.badge}
          </span>
        )}
        {!collapsed && item.count && reservations.length > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: V.blue, color: 'white',
            width: 18, height: 18, borderRadius: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {reservations.length}
          </span>
        )}
      </NavLink>
    ));

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${V.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: V.blue,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, flexShrink: 0,
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
        }}>🚌</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>{t('dashboard.nav.appName')}</div>
            <div style={{ fontSize: 10, color: V.dim }}>{t('dashboard.nav.adminPanel')}</div>
          </div>
        )}
      </div>

      {/* Navigation groups */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!collapsed && <div style={{ padding: '16px 8px 4px 12px', fontSize: 10, fontWeight: 700, color: V.dim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('dashboard.nav.main')}</div>}
        {renderNav(NAV.main)}

        {!collapsed && <div style={{ padding: '16px 8px 4px 12px', fontSize: 10, fontWeight: 700, color: V.dim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('dashboard.nav.transport')}</div>}
        {renderNav(NAV.transport)}

        {!collapsed && <div style={{ padding: '16px 8px 4px 12px', fontSize: 10, fontWeight: 700, color: V.dim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('dashboard.nav.people')}</div>}
        {renderNav(NAV.people)}

        {!collapsed && <div style={{ padding: '16px 8px 4px 12px', fontSize: 10, fontWeight: 700, color: V.dim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('dashboard.nav.system')}</div>}
        {renderNav(NAV.system)}
      </div>

      {/* User footer */}
      <div style={{ marginTop: 'auto', padding: '12px 8px', borderTop: `1px solid ${V.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 8px', borderRadius: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: V.blueBg, border: `1px solid ${V.blueBdr}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--fm-mono)', fontSize: 11, fontWeight: 600, color: V.blue,
          }}>
            {(user?.login_42 ?? 'AB').slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: V.ink }}>{user?.login_42 || 'Admin'}</div>
              <div style={{ fontSize: 10, color: V.blue, fontWeight: 600 }}>{t('dashboard.nav.staff')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 216, background: V.bg }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-200 sidebar-component"
        style={{
          width: collapsed ? 72 : 216,
          background: V.bg,
          borderRight: `1px solid ${V.line}`,
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
