import { useTheme } from '../../context/ThemeContext'
import type { Lang } from '../../types/api'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
]

interface SharedLanguageSwitcherProps {
  excludeAr?: boolean;
}

export default function LanguageSwitcher({ excludeAr = false }: SharedLanguageSwitcherProps) {
  const { lang, setLang } = useTheme()

  const langs = excludeAr ? LANGS.filter(l => l.code !== 'ar') : LANGS

  return (
    <div style={{ display: 'inline-flex', gap: 2, borderRadius: 8,
      border: '1px solid var(--line)', background: 'var(--surface2)', padding: 2 }}>
      {langs.map(l => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          style={{
            padding: '4px 10px', borderRadius: 6,
            fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: lang === l.code ? 'var(--surface)' : 'transparent',
            color: lang === l.code ? 'var(--ink)' : 'var(--dim)',
            transition: 'all 0.2s',
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
