// @ts-nocheck
import { NavLink } from 'react-router-dom';
import {
  Bus,
  Home,
  MapPinned,
  Users,
  Bell,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const DriverSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { label: t('dashboard.sidebar.overview'), icon: Home, path: '/driver/overview' },
    { label: t('dashboard.sidebar.myRoute'), icon: MapPinned, path: '/driver/route' },
    { label: t('dashboard.sidebar.passengers'), icon: Users, path: '/driver/passengers' },
    { label: t('dashboard.sidebar.notifications'), icon: Bell, path: '/driver/notifications', badge: 0 },
    { label: t('dashboard.sidebar.profile'), icon: UserCog, path: '/driver/profile' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-subtle)' }}>
          <Bus className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
            Fleetmark
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${collapsed ? 'justify-center' : ''}`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
              color: isActive ? 'var(--sidebar-item-active-text)' : 'var(--sidebar-item)',
            })}
          >
            <div className="relative shrink-0">
              <item.icon className="w-5 h-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-danger-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Profile section at bottom */}
      <div className="px-3 py-4 shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <img
            src={user?.avatar || ''}
            alt={user?.name || 'Driver'}
            className="w-9 h-9 rounded-full bg-slate-200 shrink-0 object-cover"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Driver'}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
                  Driver
                </span>
                {user?.campus && (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    {user.campus}
                  </span>
                )}
              </div>
              {user?.login42 && (
                <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>@{user.login42}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center h-10 transition-colors"
        style={{ borderTop: '1px solid var(--sidebar-border)', color: 'var(--sidebar-item)' }}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-200 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default DriverSidebar;
