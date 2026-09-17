import { describe, expect, it } from 'vitest'
import { canAccessRoute, DASHBOARD_PATHS, getLandingPathForRole, resolvePostLoginPath } from '@/lib/routes'
import type { WebAdminRole } from '@/lib/navigation'

describe('getLandingPathForRole', () => {
  it('returns role-specific landing pages', () => {
    expect(getLandingPathForRole('admin')).toBe('/dashboard')
    expect(getLandingPathForRole('koordinator')).toBe('/dashboard')
    expect(getLandingPathForRole('pemerintah')).toBe('/reports')
    // W9: petugas punya dashboard sendiri
    expect(getLandingPathForRole('petugas')).toBe('/dashboard')
  })
})

describe('canAccessRoute', () => {
  it('allows admin on any route', () => {
    expect(canAccessRoute('admin', '/settings')).toBe(true)
    expect(canAccessRoute('admin', '/staff')).toBe(true)
  })

  it('restricts petugas routes', () => {
    expect(canAccessRoute('petugas', '/transactions/add')).toBe(true)
    expect(canAccessRoute('petugas', '/balance')).toBe(false)
    expect(canAccessRoute('petugas', '/settings')).toBe(false)
    expect(canAccessRoute('petugas', '/profile/edit')).toBe(true)
  })

  it('allows koordinator settings pages', () => {
    expect(canAccessRoute('koordinator', '/institution')).toBe(true)
    expect(canAccessRoute('koordinator', '/privacy/edit')).toBe(true)
    expect(canAccessRoute('koordinator', '/about')).toBe(true)
  })

  it('restricts pemerintah routes', () => {
    expect(canAccessRoute('pemerintah', '/reports')).toBe(true)
    expect(canAccessRoute('pemerintah', '/warehouse')).toBe(true)
    expect(canAccessRoute('pemerintah', '/warehouse/sales')).toBe(false)
    expect(canAccessRoute('pemerintah', '/customers')).toBe(false)
    expect(canAccessRoute('pemerintah', '/transactions/add')).toBe(false)
  })
})

describe('resolvePostLoginPath', () => {
  it('prefers allowed from path', () => {
    expect(resolvePostLoginPath('petugas', '/pickups')).toBe('/pickups')
  })

  it('falls back to landing when from is disallowed', () => {
    expect(resolvePostLoginPath('petugas', '/balance')).toBe('/dashboard')
    expect(resolvePostLoginPath('pemerintah', null)).toBe('/reports')
  })

  it('ignores static asset from paths (manifest/favicon)', () => {
    expect(
      resolvePostLoginPath('petugas', '/brand/favicon/site.webmanifest'),
    ).toBe('/dashboard')
    expect(resolvePostLoginPath('admin', '/brand/logo.svg')).toBe('/dashboard')
    expect(resolvePostLoginPath('admin', '/favicon.ico')).toBe('/dashboard')
  })
})

describe('dashboard route audit', () => {
  const roles: WebAdminRole[] = ['admin', 'petugas', 'koordinator', 'pemerintah']

  it('guards every known dashboard path per role', () => {
    const allowedByRole: Record<WebAdminRole, string[]> = {
      admin: [...DASHBOARD_PATHS],
      petugas: [
        '/dashboard',
        '/transactions',
        '/transactions/add',
        '/pickups',
        '/customers',
        '/customers/1',
        '/reports',
        '/profile',
        '/profile/edit',
      ],
      koordinator: DASHBOARD_PATHS.filter(
        (path) =>
          !path.startsWith('/staff') &&
          path !== '/audit-log' &&
          path !== '/transactions/add',
      ),
      pemerintah: ['/dashboard', '/reports', '/warehouse', '/profile', '/profile/edit'],
    }

    for (const path of DASHBOARD_PATHS) {
      for (const role of roles) {
        const allowed = allowedByRole[role].includes(path)
        expect(canAccessRoute(role, path), `${role} ${path}`).toBe(allowed)
      }
    }
  })

  it('blocks petugas from customer write paths and balance', () => {
    expect(canAccessRoute('petugas', '/customers/add')).toBe(false)
    expect(canAccessRoute('petugas', '/customers/1/edit')).toBe(false)
    expect(canAccessRoute('petugas', '/balance')).toBe(false)
    expect(canAccessRoute('petugas', '/reward')).toBe(false)
  })
})
