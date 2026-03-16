import { useTheme } from '../../context/ThemeContext'
import type { Lang } from '../../types/api'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useTheme()

  return (
    <div style={{ display: 'inline-flex', gap: 2, borderRadius: 8,
      border: '1px solid var(--line)', background: 'var(--surface2)', padding: 2 }}>
      {LANGS.map(l => (
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
