import type { UserRole } from '@/types/models'

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
  admin: '/',
  koordinator: '/',
  pemerintah: '/laporan',
  petugas: '/transaksi/tambah',
}

const ALLOWED_PREFIXES: Record<WebAdminRole, string[]> = {
  admin: ['/'],
  petugas: ['/', '/transaksi', '/penjemputan', '/nasabah', '/laporan'],
  koordinator: [
    '/',
    '/nasabah',
    '/transaksi',
    '/penjemputan',
    '/saldo',
    '/reward',
    '/gudang',
    '/pengaduan',
    '/laporan',
  ],
  pemerintah: ['/', '/laporan', '/gudang'],
}

export function isWebAdminRoleValue(role: string): role is WebAdminRole {
  return (WEB_ADMIN_ROLES as string[]).includes(role)
}

export function getLandingPathForRole(role: WebAdminRole): string {
  return LANDING_PATH_BY_ROLE[role]
}

export function canAccessRoute(role: WebAdminRole, pathname: string): boolean {
  if (role === 'admin') return true
  if (pathname === '/') return true

  return ALLOWED_PREFIXES[role].some(
    (prefix) =>
      prefix !== '/' &&
      (pathname === prefix || pathname.startsWith(`${prefix}/`)),
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
