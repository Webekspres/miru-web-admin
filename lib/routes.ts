import type { UserRole } from '@/types/models'
import { getNavSectionsForRole, WEB_ADMIN_ROLES } from '@/lib/navigation'
import type { WebAdminRole } from '@/lib/navigation'

export type { WebAdminRole }

export const LANDING_PATH_BY_ROLE: Record<WebAdminRole, string> = {
  admin: '/dashboard',
  koordinator: '/dashboard',
  pemerintah: '/reports',
  // W9: petugas punya dashboard sendiri (bukan redirect ke input setoran)
  petugas: '/dashboard',
}

const ALLOWED_PREFIXES: Record<WebAdminRole, string[]> = {
  admin: ['/dashboard', '/settings', '/profile'],
  petugas: [
    '/dashboard',
    '/transactions',
    '/pickups',
    '/customers',
    '/reports',
    '/profile',
  ],
  koordinator: [
    '/dashboard',
    '/customers',
    '/transactions',
    '/pickups',
    '/balance',
    '/reward',
    '/warehouse',
    '/waste',
    '/education',
    '/announcements',
    '/complaints',
    '/reports',
    '/settings',
    '/profile',
  ],
  pemerintah: ['/dashboard', '/reports', '/warehouse', '/profile'],
}

export function isWebAdminRoleValue(role: string): role is WebAdminRole {
  return (WEB_ADMIN_ROLES as string[]).includes(role)
}

export function getLandingPathForRole(role: WebAdminRole): string {
  return LANDING_PATH_BY_ROLE[role]
}

export function getProfilePathForRole(role: WebAdminRole): string {
  const { settings } = getNavSectionsForRole(role)
  return settings.length > 0 ? '/settings' : '/profile'
}

export function canAccessRoute(role: WebAdminRole, pathname: string): boolean {
  if (role === 'admin') return true
  if (pathname === '/dashboard') return true

  return ALLOWED_PREFIXES[role].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/** `from` query hanya untuk path app — abaikan aset statis / manifest. */
function isAppNavigationPath(from: string): boolean {
  if (!from.startsWith('/')) return false
  if (from.startsWith('//')) return false
  if (from.startsWith('/brand/')) return false
  if (from.includes('.')) return false
  return true
}

export function resolvePostLoginPath(
  role: WebAdminRole,
  from: string | null,
): string {
  if (
    from &&
    isAppNavigationPath(from) &&
    canAccessRoute(role, from)
  ) {
    return from
  }

  return getLandingPathForRole(role)
}
