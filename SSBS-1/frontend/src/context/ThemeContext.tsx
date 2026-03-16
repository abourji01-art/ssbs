import { createContext, useContext, useEffect, useState } from 'react'
import type { Lang } from '../types/api'
import { STORAGE_KEYS } from '../config'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme:       Theme
  lang:        Lang
  isDark:      boolean
  toggleTheme: () => void
  setLang:     (lang: Lang) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null
    return stored ?? 'light'
  })
  const [lang, setLangS] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = localStorage.getItem(STORAGE_KEYS.LANG) as Lang | null
    return stored ?? 'en'
  })

  useEffect(() => {
    apply(theme)
    applyLang(lang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function apply(t: Theme) {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(STORAGE_KEYS.THEME, t)
  }

  function applyLang(l: Lang) {
    setLangS(l)
    document.documentElement.setAttribute('data-lang', l)
    document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr')
    localStorage.setItem(STORAGE_KEYS.LANG, l)
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      lang,
      isDark:      theme === 'dark',
      toggleTheme: () => apply(theme === 'dark' ? 'light' : 'dark'),
      setLang:     applyLang,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
