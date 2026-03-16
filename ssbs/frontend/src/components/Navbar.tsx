// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, LayoutDashboard, Moon, Sun } from 'lucide-react';
import FleetmarkLogo from './ui/FleetmarkLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, getDashboardPath } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('landing.nav.about'), href: '#prob' },
    { label: t('landing.nav.features'), href: '#how' },
    { label: t('landing.nav.getStarted'), href: '#auth' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {/* Logo */}
      <a href="#" className="flex items-center gap-2.5 no-underline">
        <FleetmarkLogo size="sm" />
      </a>

      {/* Desktop nav links */}
      <div className="hidden md:flex gap-px" style={{ margin: '0 auto' }}>
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-sm font-medium no-underline rounded-md transition-all duration-150"
            style={{ color: 'var(--text-secondary)', padding: '6px 14px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right controls */}
      <div className="hidden md:flex items-center gap-2">
        <LanguageSwitcher />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center rounded-lg transition-all duration-200"
          style={{
            width: 36,
            height: 36,
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.color = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {isAuthenticated && user ? (
          <button
            onClick={() => navigate(getDashboardPath(user.role))}
            className="flex items-center gap-2 rounded-lg text-[13px] font-semibold no-underline transition-all duration-200"
            style={{ padding: '7px 16px', background: 'var(--accent-primary)', color: '#fff' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(14,165,233,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('landing.nav.dashboard')}
          </button>
        ) : (
          <a
            href="#auth"
            className="rounded-lg text-[13px] font-semibold no-underline transition-all duration-200"
            style={{ padding: '7px 16px', background: 'var(--accent-primary)', color: '#fff', letterSpacing: '-0.01em' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(14,165,233,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {t('landing.nav.signup')} →
          </a>
        )}
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden flex items-center gap-2 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg"
          style={{ color: 'var(--text-primary)' }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-[64px] left-0 right-0 md:hidden"
          style={{
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div className="px-5 py-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium no-underline transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
            <div className="pt-4">
              <a
                href="#auth"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-3 rounded-lg text-sm font-semibold no-underline"
                style={{ background: 'var(--accent-primary)', color: '#fff' }}
              >
                {t('landing.nav.signup')} →
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
