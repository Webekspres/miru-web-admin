export const TOKEN_KEYS = {
  access: 'access_token',
  refresh: 'refresh_token',
} as const

export const ROLE_COOKIE_KEY = 'miru_role'

/** Max-age cookie session (detik) — dipakai proxy edge guard */
export const ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24

export const AUTH_ROUTES = ['/login'] as const

/** Rute publik yang tidak memerlukan autentikasi */
export const PUBLIC_ROUTES = ['/', '/login'] as const

export const PUBLIC_FILE =
  /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/
