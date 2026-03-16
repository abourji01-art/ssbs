import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const V = {
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  blueBdr: 'var(--fm-blue-bdr)',
  green: 'var(--fm-green)',
} as const;

interface ToggleSetting {
  key: string;
  label: string;
  desc: string;
  defaultOn: boolean;
}

const settingGroups = [
  {
    title: 'Notifications',
    icon: '🔔',
    items: [
      { key: 'email_notif', label: 'Email Notifications', desc: 'Receive alerts via email', defaultOn: true },
      { key: 'push_notif', label: 'Push Notifications', desc: 'Browser push notifications', defaultOn: false },
      { key: 'sms_notif', label: 'SMS Alerts', desc: 'Text messages for critical events', defaultOn: false },
    ] as ToggleSetting[],
  },
  {
    title: 'System',
    icon: '⚙️',
    items: [
      { key: 'dark_mode', label: 'Dark Mode', desc: 'Coming soon', defaultOn: false },
      { key: 'auto_assign', label: 'Auto-assign Buses', desc: 'Automatically assign buses to routes', defaultOn: true },
      { key: 'maintenance', label: 'Maintenance Mode', desc: 'Disable bookings temporarily', defaultOn: false },
    ] as ToggleSetting[],
  },
  {
    title: 'Language',
    icon: '🌐',
    items: [
      { key: 'lang', label: 'Interface Language', desc: 'Choose your preferred language', defaultOn: true },
    ] as ToggleSetting[],
  },
];

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    settingGroups.forEach((g) => g.items.forEach((i) => { init[i.key] = i.defaultOn; }));
    return init;
  });
  const [lang, setLang] = useState<'en' | 'fr' | 'ar'>(i18n.language as 'en' | 'fr' | 'ar' || 'en');

  const handleToggle = (key: string) => {
    if (key === 'dark_mode') {
      toggleTheme();
      return;
    }
    setToggles((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {settingGroups.map((group) => (
        <div key={group.title} style={{
          background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
          overflow: 'hidden', transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{
            padding: '14px 20px', borderBottom: `1px solid ${V.line}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 15 }}>{group.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: V.ink }}>{group.title}</span>
          </div>

          {group.items.map((item, i) => (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: i < group.items.length - 1 ? `1px solid ${V.line}` : 'none',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>{item.label}</div>
                <div style={{ fontSize: 11, color: V.dim, marginTop: 2 }}>{item.desc}</div>
              </div>

              {item.key === 'lang' ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['en', 'fr', 'ar'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); i18n.changeLanguage(l); }}
                      style={{
                        padding: '5px 14px', borderRadius: 6,
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        background: lang === l ? V.blueBg : V.white,
                        color: lang === l ? V.blue : V.mid,
                        border: `1px solid ${lang === l ? V.blueBdr : V.line}`,
                        fontFamily: "'Geist', sans-serif",
                      }}
                    >
                      {l === 'en' ? '🇬🇧 EN' : l === 'fr' ? '🇫🇷 FR' : '🇲🇦 AR'}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => handleToggle(item.key)}
                  style={{
                    width: 40, height: 22, borderRadius: 11, border: 'none',
                    background: (item.key === 'dark_mode' ? isDark : toggles[item.key]) ? V.blue : V.line,
                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3,
                    left: (item.key === 'dark_mode' ? isDark : toggles[item.key]) ? 21 : 3,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Settings;
