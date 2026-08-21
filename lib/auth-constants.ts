export const TOKEN_KEYS = {
  access: 'access_token',
  refresh: 'refresh_token',
} as const

export const ROLE_COOKIE_KEY = 'miru_role'

/** Max-age cookie session (detik) — dipakai proxy edge guard */
export const ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24

export const AUTH_ROUTES = ['/login', '/forgot-password'] as const

/** Rute publik yang tidak memerlukan autentikasi */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/forgot-password',
  '/edukasi',
  '/privacy-policy',
  '/terms',
] as const

/** Aset statis di `public/` — jangan di-gate auth (termasuk PWA manifest). */
export const PUBLIC_FILE =
  /\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|txt|map|woff2?|ttf)$/i

/** Prefix folder publik (logo, manifest, favicon) — selalu lewat tanpa login. */
export const PUBLIC_ASSET_PREFIXES = ['/brand'] as const
