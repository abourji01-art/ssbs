import { useTheme } from '../../context/ThemeContext'

export default function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div style={{
      display: 'inline-flex',
      borderRadius: 8,
      border: '1px solid var(--line)',
      background: 'var(--surface2)',
      padding: 2,
    }}>
      <button
        onClick={() => isDark && toggleTheme()}
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 11, fontWeight: 600,
          border: 'none', cursor: 'pointer',
          background: !isDark ? 'var(--surface)' : 'transparent',
          color: !isDark ? 'var(--ink)' : 'var(--dim)',
          transition: 'all 0.25s',
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        ☀️ Light
      </button>
      <button
        onClick={() => !isDark && toggleTheme()}
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 11, fontWeight: 600,
          border: 'none', cursor: 'pointer',
          background: isDark ? 'var(--surface2)' : 'transparent',
          color: isDark ? 'var(--ink)' : 'var(--dim)',
          transition: 'all 0.25s',
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        🌙 Dark
      </button>
    </div>
  )
}
