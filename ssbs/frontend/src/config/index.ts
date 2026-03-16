const DEFAULT_API_URL = '/api/v1'

function resolveApiUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim()

  if (typeof window === 'undefined') {
    return configured || DEFAULT_API_URL
  }

  if (!configured) {
    return DEFAULT_API_URL
  }

  try {
    const url = new URL(configured, window.location.origin)

    // When the app is served via HTTPS behind the WAF, force API traffic to
    // stay on the same origin instead of downgrading to plain HTTP localhost.
    if (window.location.protocol === 'https:' && url.protocol === 'http:') {
      return DEFAULT_API_URL
    }

    return url.toString().replace(/\/$/, '')
  } catch {
    return configured.replace(/\/$/, '')
  }
}

export const API_URL = resolveApiUrl()

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'fleetmark_access',
  REFRESH_TOKEN: 'fleetmark_refresh',
  USER:          'fleetmark_user',
  THEME:         'fleetmark_theme',
  LANG:          'fleetmark_lang',
} as const

export const SERVICE_WINDOWS = {
  peak:         { start: 20, end: 24 },
  consolidated: { start: 1,  end: 6  },
} as const
