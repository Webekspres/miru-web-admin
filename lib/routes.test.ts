import { describe, expect, it } from 'vitest'
import {
  canAccessRoute,
  getLandingPathForRole,
  resolvePostLoginPath,
} from '@/lib/routes'

describe('getLandingPathForRole', () => {
  it('returns role-specific landing pages', () => {
    expect(getLandingPathForRole('admin')).toBe('/dashboard')
    expect(getLandingPathForRole('koordinator')).toBe('/dashboard')
    expect(getLandingPathForRole('pemerintah')).toBe('/reports')
    expect(getLandingPathForRole('petugas')).toBe('/transactions/add')
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
  })

  it('restricts pemerintah routes', () => {
    expect(canAccessRoute('pemerintah', '/reports')).toBe(true)
    expect(canAccessRoute('pemerintah', '/warehouse')).toBe(true)
    expect(canAccessRoute('pemerintah', '/customers')).toBe(false)
  })
})

describe('resolvePostLoginPath', () => {
  it('prefers allowed from path', () => {
    expect(resolvePostLoginPath('petugas', '/pickups')).toBe('/pickups')
  })

  it('falls back to landing when from is disallowed', () => {
    expect(resolvePostLoginPath('petugas', '/balance')).toBe('/transactions/add')
    expect(resolvePostLoginPath('pemerintah', null)).toBe('/reports')
  })
})
