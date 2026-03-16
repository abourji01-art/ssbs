import { createContext, useContext, useState, type ReactNode } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Ticket, ClipboardList, Settings,
  Menu, X,
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
  mono: 'var(--fm-mono)',
} as const;

/* ── Nav item type ── */
interface NavItem {
  icon: ReactNode;
  labelKey: string;
  path: string;
}

/* ── useStudentNav hook ── */
interface StudentNavContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const StudentNavContext = createContext<StudentNavContextType | undefined>(undefined);

export const useStudentNav = () => {
  const ctx = useContext(StudentNavContext);
  if (!ctx) throw new Error('useStudentNav must be used within StudentLayout');
  return ctx;
};

/* ── Navigation config ── */
const ICON_SIZE = 16;

const NAV_ITEMS: Record<string, NavItem[]> = {
  shuttle: [
    { icon: <LayoutDashboard size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.overview', path: '/student/overview' },
    { icon: <Ticket size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.reserve', path: '/student/reserve' },
    { icon: <ClipboardList size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.history', path: '/student/history' },
  ],
  account: [
    { icon: <Settings size={ICON_SIZE} />, labelKey: 'dashboard.sidebar.settings', path: '/student/settings' },
  ],
};

const PAGE_TITLES: Record<string, string> = {
  '/student': 'Overview',
  '/student/overview': 'Overview',
  '/student/reserve': 'Reserve a Seat',
  '/student/history': 'My History',
  '/student/settings': 'Settings',
};

const SECTION_LABELS: Record<string, string> = {
  shuttle: 'dashboard.nav.shuttle',
  account: 'dashboard.nav.account',
};

/* ── Component ── */
const StudentLayout = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState(PAGE_TITLES[location.pathname] ?? 'Dashboard');

  const login42 = user?.login_42 || 'student';
  const initials = login42.slice(0, 2).toUpperCase();

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
    </NavLink>
  );

  /* ── Sidebar content ── */
  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: `1px solid ${V.line}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: V.blue,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, flexShrink: 0,
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
        }}>🚌</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
            {t('dashboard.nav.appName')}
          </div>
          <div style={{ fontSize: 10, color: V.dim }}>
            {t('dashboard.nav.studentPortal', 'Student Portal')}
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
        {Object.entries(NAV_ITEMS).map(([section, items]) => (
          <div key={section}>
            <div style={{
              padding: '14px 8px 4px 12px',
              fontSize: 10, fontWeight: 700, color: V.dim,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {t(SECTION_LABELS[section] ?? section)}
            </div>
            {items.map(renderNavItem)}
          </div>
        ))}
      </div>

      {/* User footer */}
      <div style={{ padding: '12px 8px', borderTop: `1px solid ${V.line}` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 8px', borderRadius: 8,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: V.blueBg, border: `1px solid ${V.blueBdr}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: V.mono, fontSize: 11, fontWeight: 600, color: V.blue,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: V.ink }}>{login42}</div>
            <div style={{ fontSize: 10, color: V.dim }}>
              {t('dashboard.nav.student1337', '1337 Student')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <StudentNavContext.Provider value={{ pageTitle, setPageTitle }}>
      <div className="flex min-h-screen" style={{ background: V.bg }}>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:hidden ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ width: 216, background: V.surface }}
        >
          <div className="flex items-center justify-end p-2 lg:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              style={{ color: V.mid, background: 'none', border: 'none', cursor: 'pointer' }}
            >
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
              display: 'flex', alignItems: 'center',
              padding: '0 20px', gap: 10, flexShrink: 0,
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
            <div style={{
              fontSize: 15, fontWeight: 700, color: V.ink,
              flex: 1, letterSpacing: '-0.01em',
            }}>
              {pageTitle}
            </div>

            {/* User avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: V.blueBg, border: `1px solid ${V.blueBdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: V.mono, fontSize: 11, fontWeight: 600, color: V.blue,
            }}>
              {initials}
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6" key={location.pathname}>
            <Outlet />
          </main>
        </div>
      </div>
    </StudentNavContext.Provider>
  );
};

export default StudentLayout;
