import type { UserRole } from '@/types/models'
import { getNavSectionsForRole } from '@/lib/navigation'

export type WebAdminRole = Extract<
  UserRole,
  'admin' | 'petugas' | 'koordinator' | 'pemerintah'
>

const WEB_ADMIN_ROLES: WebAdminRole[] = [
  'admin',
  'petugas',
  'koordinator',
  'pemerintah',
]

export const LANDING_PATH_BY_ROLE: Record<WebAdminRole, string> = {
  admin: '/dashboard',
  koordinator: '/dashboard',
  pemerintah: '/reports',
  petugas: '/transactions/add',
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

export function resolvePostLoginPath(
  role: WebAdminRole,
  from: string | null,
): string {
  if (from && from.startsWith('/') && canAccessRoute(role, from)) {
    return from
  }

  return getLandingPathForRole(role)
}
