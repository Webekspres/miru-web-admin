import { ROLE_COOKIE_KEY } from '@/lib/auth-constants'
import type { WebAdminRole } from '@/lib/routes'

/** Nama cookie CSRF (double-submit) yang di-set backend pada login/refresh.
 * Bukan HttpOnly — JS perlu membacanya untuk mengirim header X-CSRFToken. */
export const CSRF_COOKIE_NAME = 'csrf_token'

function secureFlag(): string {
  if (typeof window === 'undefined') return ''
  return window.location.protocol === 'https:' ? '; Secure' : ''
}

function expiresInSeconds(seconds: number): string {
  return `; max-age=${seconds}`
}

/** Baca nilai cookie CSRF dari backend (non-HttpOnly, SameSite=Lax). */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`))
  if (!match) return null
  try {
    return decodeURIComponent(match.slice(CSRF_COOKIE_NAME.length + 1))
  } catch {
    return null
  }
}

/** Hapus cookie CSRF lokal (non-HttpOnly) — HttpOnly access/refresh cookie
 * hanya bisa dihapus lewat endpoint /auth/logout/ di backend. */
export function clearCsrfToken(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${CSRF_COOKIE_NAME}=; path=/; max-age=0`
}

export function setRoleCookie(role: WebAdminRole, maxAgeSeconds = 60 * 60 * 24): void {
  if (typeof document === 'undefined') return

  document.cookie = `${ROLE_COOKIE_KEY}=${role}; path=/; SameSite=Lax${expiresInSeconds(maxAgeSeconds)}${secureFlag()}`
}

export function clearRoleCookie(): void {
  if (typeof document === 'undefined') return

  document.cookie = `${ROLE_COOKIE_KEY}=; path=/; max-age=0`
}