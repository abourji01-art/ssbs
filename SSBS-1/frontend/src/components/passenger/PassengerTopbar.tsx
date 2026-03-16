// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

const V = {
  bg: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  blueBdr: 'var(--fm-blue-bdr)',
  red: 'var(--fm-red)',
  surface: 'var(--fm-surface)',
} as const;

const PassengerTopbar = ({ title, onMenuClick }: TopbarProps) => {
  const { t } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
    <header style={{
      height: 52,
      background: V.bg,
      borderBottom: `1px solid ${V.line}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 10,
      flexShrink: 0,
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: V.mid }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div style={{ fontSize: 15, fontWeight: 700, color: V.ink, flex: 1, letterSpacing: '-0.01em' }}>
        {title}
      </div>

      {/* Notification bell */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        border: `1px solid ${V.line}`, background: V.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 14, position: 'relative',
      }}>
        🔔
      </div>

      {/* Avatar with dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <div
          onClick={() => setProfileOpen(!profileOpen)}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: V.blueBg, border: `1px solid ${V.blueBdr}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--fm-mono)', fontSize: 11, fontWeight: 600, color: V.blue,
            cursor: 'pointer',
          }}
        >
          {user?.initials || 'ST'}
        </div>

        {profileOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 40,
            width: 160, background: V.bg,
            border: `1px solid ${V.line}`, borderRadius: 10,
            boxShadow: 'var(--fm-shadow-md)',
            overflow: 'hidden', zIndex: 50,
          }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${V.line}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: V.ink }}>{user?.name || 'Student'}</div>
              <div style={{ fontSize: 10, color: V.dim }}>@{user?.login42 || 'student'}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', background: 'none', border: 'none',
                fontSize: 12, fontWeight: 500, color: V.red, cursor: 'pointer',
                fontFamily: "'Geist', sans-serif",
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default PassengerTopbar;
