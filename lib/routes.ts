import { WEB_ADMIN_ROLES } from '@/lib/navigation'
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
    '/institution',
    '/privacy',
    '/about',
    '/syarat-ketentuan',
  ],
  pemerintah: ['/dashboard', '/reports', '/warehouse', '/profile'],
}

/** Path yang harus selalu punya guard role (audit Fase 7). */
export const DASHBOARD_PATHS = [
  '/dashboard',
  '/transactions',
  '/transactions/add',
  '/pickups',
  '/balance',
  '/customers',
  '/customers/add',
  '/customers/1',
  '/customers/1/edit',
  '/staff',
  '/staff/add',
  '/staff/1/edit',
  '/reward',
  '/warehouse',
  '/warehouse/sales',
  '/warehouse/partners',
  '/waste',
  '/waste/categories',
  '/education',
  '/education/add',
  '/education/1/edit',
  '/complaints',
  '/reports',
  '/announcements',
  '/audit-log',
  '/settings',
  '/profile',
  '/profile/edit',
  '/institution',
  '/institution/edit',
  '/privacy',
  '/privacy/edit',
  '/about',
  '/about/edit',
  '/syarat-ketentuan',
  '/syarat-ketentuan/edit',
] as const

const WRITE_PATH_RE = /\/(add|edit)$/

function isWritePath(pathname: string): boolean {
  return WRITE_PATH_RE.test(pathname)
}

function matchesAllowedPrefix(role: WebAdminRole, pathname: string): boolean {
  return ALLOWED_PREFIXES[role].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function isWebAdminRoleValue(role: string): role is WebAdminRole {
  return (WEB_ADMIN_ROLES as string[]).includes(role)
}

export function getLandingPathForRole(role: WebAdminRole): string {
  return LANDING_PATH_BY_ROLE[role]
}

export function getProfilePathForRole(_role: WebAdminRole): string {
  return '/profile'
}

export function canAccessRoute(role: WebAdminRole, pathname: string): boolean {
  if (pathname === '/dashboard') return true
  if (role === 'admin') return true

  if (!matchesAllowedPrefix(role, pathname)) return false

  if (role === 'pemerintah' && pathname.startsWith('/warehouse/')) {
    return false
  }

  if (role === 'petugas' && pathname.startsWith('/customers') && isWritePath(pathname)) {
    return false
  }

  if (
    (role === 'koordinator' || role === 'pemerintah') &&
    pathname.startsWith('/transactions') &&
    isWritePath(pathname)
  ) {
    return false
  }

  return true
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
