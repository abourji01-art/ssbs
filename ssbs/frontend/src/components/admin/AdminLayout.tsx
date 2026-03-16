// @ts-nocheck
import { createContext, useContext, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useReservations } from '../../hooks/useApi';
import {
  LayoutDashboard, Bus, MapPin, Clock,
  ClipboardList, Car, Users, Settings,
  Search, Bell, Menu, X,
} from 'lucide-react';

/* ── Design tokens ── */
const V = {
  surface: 'var(--fm-surface)',
  surface2: 'var(--fm-surface2)',
  bg: 'var(--fm-bg)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  blueBdr: 'var(--fm-blue-bdr)',
  amber: 'var(--fm-amber)',
  amberBg: 'var(--fm-amber-bg)',
  amberBdr: 'var(--fm-amber-bdr)',
  red: 'var(--fm-red)',
  mono: 'var(--fm-mono)',
} as const;

/* ── Nav item type ── */
interface NavItem {
  icon: ReactNode;
  labelKey: string;
  path: string;
  badge?: string;
  count?: boolean;
}

/* ── useAdminNav hook for page title management ── */
interface AdminNavContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const AdminNavContext = createContext<AdminNavContextType | undefined>(undefined);

export const useAdminNav = () => {
  const ctx = useContext(AdminNavContext);
  if (!ctx) throw new Error('useAdminNav must be used within AdminLayout');
  return ctx;
};

/* ── Props ── */
interface AdminLayoutProps {
  children: ReactNode;
  defaultTitle?: string;
}

/* ── Navigation config ── */
const ICON_SIZE = 16;

const buildNav = (): Record<string, NavItem[]> => ({
  main: [
    { icon: <LayoutDashboard size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.overview', path: '/admin/overview' },
  ],
  transport: [
    { icon: <Bus size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.buses', path: '/admin/buses' },
    { icon: <MapPin size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.routes', path: '/admin/routes' },
    { icon: <Clock size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.schedule', path: '/admin/schedule', badge: 'SOON' },
  ],
  people: [
    { icon: <ClipboardList size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.reserve', path: '/admin/reservations', count: true },
    { icon: <Car size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.passengers', path: '/admin/drivers' },
    { icon: <Users size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.users', path: '/admin/students' },
  ],
  system: [
    { icon: <Settings size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.profile', path: '/admin/settings' },
  ],
});

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/overview': 'Overview',
  '/admin/buses': 'Buses',
  '/admin/routes': 'Routes',
  '/admin/trips': 'Trips',
  '/admin/reservations': 'Reservations',
  '/admin/drivers': 'Drivers',
  '/admin/students': 'Students',
  '/admin/users': 'User Management',
  '/admin/schedule': 'Schedule Management',
  '/admin/reports': 'Reports & Analytics',
  '/admin/notifications': 'Notifications',
  '/admin/settings': 'Settings',
};

/* ── Component ── */
const AdminLayout = ({ children, defaultTitle }: AdminLayoutProps) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const { data: reservations = [] } = useReservations();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState(defaultTitle ?? PAGE_TITLES[location.pathname] ?? 'Dashboard');

  const NAV = buildNav();
  const initials = user?.initials || 'AB';
  const userName = user?.name || 'Admin';

  const sectionLabels: Record<string, string> = {
    main: t('dashboard.nav.main'),
    transport: t('dashboard.nav.transport'),
    people: t('dashboard.nav.people'),
    system: t('dashboard.nav.system'),
  };

  const renderNavItem = (item: NavItem) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={() => setMobileOpen(false)}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '7px 10px',
        margin: '1px 6px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        color: isActive ? V.blue : V.mid,
        background: isActive ? V.blueBg : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s',
      })}
    >
      <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
      <span style={{ flex: 1 }}>{t(item.labelKey)}</span>
      {item.badge && (
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
          background: V.amberBg, color: V.amber, border: `1px solid ${V.amberBdr}`,
        }}>
          {item.badge}
        </span>
      )}
      {item.count && reservations.length > 0 && (
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
  );

  /* ── Sidebar content ── */
  const sidebar = (
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
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>{t('dashboard.nav.appName')}</div>
          <div style={{ fontSize: 10, color: V.dim }}>{t('dashboard.nav.adminPanel')}</div>
        </div>
      </div>

      {/* Nav groups */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
        {Object.entries(NAV).map(([section, items]) => (
          <div key={section}>
            <div style={{ padding: '14px 8px 4px 12px', fontSize: 10, fontWeight: 700, color: V.dim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {sectionLabels[section]}
            </div>
            {items.map(renderNavItem)}
          </div>
        ))}
      </div>

      {/* User footer */}
      <div style={{ padding: '12px 8px', borderTop: `1px solid ${V.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 8px', borderRadius: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: V.blueBg, border: `1px solid ${V.blueBdr}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: V.mono, fontSize: 11, fontWeight: 600, color: V.blue,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: V.ink }}>{userName}</div>
            <div style={{ fontSize: 10, color: V.blue, fontWeight: 600 }}>{t('dashboard.nav.staff')}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminNavContext.Provider value={{ pageTitle, setPageTitle }}>
      <div className="flex min-h-screen" style={{ background: V.bg }}>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Mobile sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:hidden ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ width: 216, background: V.surface }}
        >
          <div className="flex items-center justify-end p-2 lg:hidden">
            <button onClick={() => setMobileOpen(false)} style={{ color: V.mid, background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          {sidebar}
        </aside>

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:block fixed inset-y-0 left-0 z-30"
          style={{ width: 216, background: V.surface, borderRight: `1px solid ${V.line}` }}
        >
          {sidebar}
        </aside>

        {/* Main area */}
        <div className="flex flex-col flex-1 lg:ml-[216px]">
          {/* Topbar — 52px */}
          <header
            style={{
              height: 52,
              background: V.surface,
              borderBottom: `1px solid ${V.line}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: 10,
              flexShrink: 0,
            }}
          >
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: V.mid }}
            >
              <Menu size={18} />
            </button>

            {/* Page title */}
            <div style={{ fontSize: 15, fontWeight: 700, color: V.ink, flex: 1, letterSpacing: '-0.01em' }}>
              {pageTitle}
            </div>

            {/* Search */}
            <div className="hidden sm:flex items-center" style={{
              padding: '5px 12px', borderRadius: 8,
              border: `1px solid ${V.line}`, background: V.bg,
              gap: 6, width: 180,
            }}>
              <Search size={14} style={{ color: V.dim, flexShrink: 0 }} />
              <input
                type="text"
                placeholder={t('dashboard.common.search')}
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 13, color: V.ink, width: '100%',
                  fontFamily: "'Geist', sans-serif",
                }}
              />
            </div>

            {/* Notification bell */}
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${V.line}`, background: V.surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}>
              <Bell size={15} style={{ color: V.mid }} />
              <div style={{
                position: 'absolute', top: -2, right: -2,
                width: 8, height: 8, borderRadius: '50%',
                background: V.red, border: `2px solid ${V.surface}`,
              }} />
            </div>

            {/* User avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: V.blueBg, border: `1px solid ${V.blueBdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: V.mono, fontSize: 11, fontWeight: 600, color: V.blue,
              cursor: 'pointer',
            }}>
              {initials}
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6" key={location.pathname}>
            {children}
          </main>
        </div>
      </div>
    </AdminNavContext.Provider>
  );
};

export default AdminLayout;
