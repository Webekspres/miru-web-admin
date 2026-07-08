import { describe, expect, it } from 'vitest'
import {
  canAccessRoute,
  getLandingPathForRole,
  resolvePostLoginPath,
} from '@/lib/routes'

describe('getLandingPathForRole', () => {
  it('returns role-specific landing pages', () => {
    expect(getLandingPathForRole('admin')).toBe('/')
    expect(getLandingPathForRole('koordinator')).toBe('/')
    expect(getLandingPathForRole('pemerintah')).toBe('/laporan')
    expect(getLandingPathForRole('petugas')).toBe('/transaksi/tambah')
  })
})

describe('canAccessRoute', () => {
  it('allows admin on any route', () => {
    expect(canAccessRoute('admin', '/pengaturan')).toBe(true)
    expect(canAccessRoute('admin', '/petugas')).toBe(true)
  })

  it('restricts petugas routes', () => {
    expect(canAccessRoute('petugas', '/transaksi/tambah')).toBe(true)
    expect(canAccessRoute('petugas', '/saldo')).toBe(false)
    expect(canAccessRoute('petugas', '/pengaturan')).toBe(false)
  })

  it('restricts pemerintah routes', () => {
    expect(canAccessRoute('pemerintah', '/laporan')).toBe(true)
    expect(canAccessRoute('pemerintah', '/gudang')).toBe(true)
    expect(canAccessRoute('pemerintah', '/nasabah')).toBe(false)
  })
})

describe('resolvePostLoginPath', () => {
  it('prefers allowed from path', () => {
    expect(resolvePostLoginPath('petugas', '/penjemputan')).toBe('/penjemputan')
  })

  it('falls back to landing when from is disallowed', () => {
    expect(resolvePostLoginPath('petugas', '/saldo')).toBe('/transaksi/tambah')
    expect(resolvePostLoginPath('pemerintah', null)).toBe('/laporan')
  })
})
