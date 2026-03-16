import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStoredUser, patchMe } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StopPicker from '../../components/shared/StopPicker';

const V = {
  ink: 'var(--fm-ink)', mid: 'var(--fm-mid)', dim: 'var(--fm-dim)',
  surface: 'var(--fm-surface)', line: 'var(--fm-line)',
  blue: 'var(--fm-blue)', mono: 'var(--fm-mono)',
} as const;

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

export default function Settings() {
  const user = getStoredUser();
  const { logout } = useAuth();
  const { i18n } = useTranslation();
  const [station, setStation] = useState(user?.station ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!station) return;
    setSaving(true);
    try {
      const updated = await patchMe({ station });
      localStorage.setItem('fleetmark_user', JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    setSaving(false);
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('fleetmark_theme', next);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink, marginBottom: 24 }}>Settings</h2>

      {/* Profile card */}
      <div style={{
        padding: 20, background: V.surface, borderRadius: 12,
        border: `1px solid ${V.line}`, marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 4 }}>Account</div>
        <div style={{ fontSize: 12, color: V.dim, fontFamily: V.mono }}>
          {user?.login_42 ?? '—'}
        </div>
        <div style={{ fontSize: 11, color: V.dim, marginTop: 2 }}>
          {user?.email ?? '—'}
        </div>
      </div>

      {/* Station picker */}
      <div style={{
        padding: 20, background: V.surface, borderRadius: 12,
        border: `1px solid ${V.line}`, marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 12 }}>
          My Stop
        </div>
        {user?.station_name && (
          <div style={{ fontSize: 12, color: V.dim, marginBottom: 10 }}>
            Current: <span style={{ color: V.ink, fontWeight: 600 }}>{user.station_name}</span>
          </div>
        )}
        <StopPicker value={station} onChange={setStation} />

        <button
          onClick={handleSave}
          disabled={saving || !station}
          style={{
            marginTop: 16, width: '100%',
            padding: '10px 0', borderRadius: 8,
            border: 'none', cursor: saving ? 'wait' : 'pointer',
            background: V.blue, color: '#fff',
            fontSize: 13, fontWeight: 600,
            opacity: saving || !station ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      {/* Language */}
      <div style={{
        padding: 20, background: V.surface, borderRadius: 12,
        border: `1px solid ${V.line}`, marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 12 }}>Language</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => i18n.changeLanguage(l.code)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8,
                border: `1px solid ${i18n.language === l.code ? V.blue : V.line}`,
                background: i18n.language === l.code ? 'var(--fm-blue-bg)' : 'transparent',
                color: i18n.language === l.code ? V.blue : V.mid,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dark mode */}
      <div style={{
        padding: 20, background: V.surface, borderRadius: 12,
        border: `1px solid ${V.line}`, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>Dark Mode</div>
          <button
            onClick={toggleTheme}
            style={{
              padding: '6px 16px', borderRadius: 8,
              border: `1px solid ${V.line}`, background: 'transparent',
              color: V.mid, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Toggle ☀️/🌙
          </button>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={logout}
        style={{
          width: '100%', padding: '12px 0', borderRadius: 8,
          border: '1px solid #EF444433', background: '#EF444411',
          color: '#EF4444', fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </div>
  );
}
