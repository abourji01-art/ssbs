// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ui/ThemeToggle';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

const DriverTopbar = ({ title, onMenuClick }: TopbarProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = 0;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: menu + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        </div>

        {/* Right: search, bell, profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="hidden sm:flex items-center rounded-xl px-3 py-2 w-56 transition-all" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
            <Search className="w-4 h-4 mr-2 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder={t('dashboard.common.searchPassengers')}
              className="bg-transparent text-sm outline-none w-full"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification bell */}
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ color: 'var(--text-tertiary)' }}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ border: '2px solid var(--bg-card)' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors"
            >
              <img
                src={user?.avatar || ''}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              />
              <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name.split(' ')[0] || 'Driver'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${profileOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-tertiary)' }} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Driver'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user?.email || ''}</p>
                </div>
                <div className="py-1">
                  {[
                    { icon: User, label: t('dashboard.common.profile') },
                    { icon: Settings, label: t('dashboard.common.settings') },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="py-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('dashboard.sidebar.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DriverTopbar;
