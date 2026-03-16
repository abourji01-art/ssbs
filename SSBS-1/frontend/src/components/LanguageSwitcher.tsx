import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const V = {
  surface2: 'var(--fm-surface2)',
  line: 'var(--fm-line)',
  mid: 'var(--fm-mid)',
  blue: 'var(--fm-blue)',
} as const;

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
] as const;

interface LanguageSwitcherProps {
  excludeAr?: boolean;
}

export default function LanguageSwitcher({ excludeAr = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const { setLang } = useTheme();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    setLang(code as 'en' | 'fr' | 'ar');
  };

  const langs = excludeAr ? LANGS.filter(l => l.code !== 'ar') : LANGS;

  return (
    <div style={{
      display: 'flex',
      background: V.surface2,
      border: `1px solid ${V.line}`,
      borderRadius: 7,
      padding: 2,
    }}>
      {langs.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          style={{
            padding: '4px 10px',
            borderRadius: 5,
            fontSize: 11, fontWeight: 600,
            border: 'none', cursor: 'pointer',
            background: i18n.language === code ? V.blue : 'transparent',
            color: i18n.language === code ? 'white' : V.mid,
            transition: 'all 0.15s',
            fontFamily: "'Geist', sans-serif",
          }}
          aria-label={`Switch to ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
