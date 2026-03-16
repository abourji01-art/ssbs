// @ts-nocheck
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
}

const NAV: Record<string, NavItem[]> = {
  shuttle: [
    { emoji: '🏠', label: 'Overview', path: '/student/overview' },
    { emoji: '🎫', label: 'Reserve a Seat', path: '/student/reserve' },
    { emoji: '📋', label: 'My History', path: '/student/reservations' },
  ],
  account: [
    { emoji: '⚙️', label: 'Settings', path: '/student/settings' },
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
} as const;

const PassengerSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) => {
  const { user } = useAuth();
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
            <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>{t('dashboard.nav.appName', 'Fleetmark')}</div>
            <div style={{ fontSize: 10, color: V.dim }}>{t('dashboard.nav.studentPortal', 'Student Portal')}</div>
          </div>
        )}
      </div>

      {/* Navigation groups */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!collapsed && <div style={{ padding: '16px 8px 4px 12px', fontSize: 10, fontWeight: 700, color: V.dim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('dashboard.passenger.myShuttle', 'My Shuttle')}</div>}
        {renderNav(NAV.shuttle)}

        {!collapsed && <div style={{ padding: '16px 8px 4px 12px', fontSize: 10, fontWeight: 700, color: V.dim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('dashboard.nav.account', 'Account')}</div>}
        {renderNav(NAV.account)}
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
            {user?.initials || 'ST'}
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: V.ink }}>{user?.name || 'Student'}</div>
              <div style={{ fontSize: 10, color: V.blue, fontWeight: 600 }}>Student</div>
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
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-200"
        style={{
          width: collapsed ? 72 : 216,
          background: V.bg,
          borderRight: `1px solid ${V.line}`,
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default PassengerSidebar;
