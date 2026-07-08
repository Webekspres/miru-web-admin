import {
  ACCESS_TOKEN_COOKIE_MAX_AGE,
  ROLE_COOKIE_KEY,
  TOKEN_KEYS,
} from '@/lib/auth-constants'
import type { WebAdminRole } from '@/lib/routes'

export function setAccessTokenCookie(token: string): void {
  if (typeof document === 'undefined') return

  const value = encodeURIComponent(token)
  document.cookie = `${TOKEN_KEYS.access}=${value}; path=/; SameSite=Lax; max-age=${ACCESS_TOKEN_COOKIE_MAX_AGE}`
}

export function clearAccessTokenCookie(): void {
  if (typeof document === 'undefined') return

  document.cookie = `${TOKEN_KEYS.access}=; path=/; max-age=0`
}

export function setRoleCookie(role: WebAdminRole): void {
  if (typeof document === 'undefined') return

  document.cookie = `${ROLE_COOKIE_KEY}=${role}; path=/; SameSite=Lax; max-age=${ACCESS_TOKEN_COOKIE_MAX_AGE}`
}

export function clearRoleCookie(): void {
  if (typeof document === 'undefined') return

  document.cookie = `${ROLE_COOKIE_KEY}=; path=/; max-age=0`
}
