import { describe, expect, it } from 'vitest'
import { getNavItemsForRole } from './navigation'
import { actionsForRole } from '@/components/pickups/PickupManagement'

const hrefs = (role: Parameters<typeof getNavItemsForRole>[0]) =>
  getNavItemsForRole(role).map((item) => item.href)

describe('menu per role', () => {
  it('petugas: field work, own history and own profile only', () => {
    expect(hrefs('petugas')).toEqual([
      '/dashboard',
      '/transactions/add',
      '/pickups',
      '/transactions',
      '/profile',
    ])
  })

  it('koordinator and pemerintah can edit their own profile', () => {
    expect(hrefs('koordinator')).toContain('/profile')
    expect(hrefs('pemerintah')).toContain('/profile')
  })

  it('app-wide settings stay out of petugas and pemerintah menus', () => {
    expect(hrefs('petugas')).not.toContain('/settings')
    expect(hrefs('pemerintah')).not.toContain('/settings')
  })
})

describe('pickup actions per role (mirrors backend transitions)', () => {
  const labels = (status: Parameters<typeof actionsForRole>[0], role: string) =>
    actionsForRole(status, role).map((a) => a.label)

  it('only admin approves, rejects and assigns', () => {
    expect(labels('menunggu', 'admin')).toEqual(['Setujui', 'Tolak'])
    expect(labels('disetujui', 'admin')).toEqual(['Tugaskan Petugas'])
    expect(labels('menunggu', 'petugas')).toEqual([])
    expect(labels('disetujui', 'petugas')).toEqual([])
    expect(labels('disetujui', 'koordinator')).toEqual([])
  })

  it('petugas runs the field steps', () => {
    expect(labels('dijadwalkan', 'petugas')).toEqual(['Mulai Penjemputan'])
    expect(labels('dalam_perjalanan', 'petugas')).toEqual(['Sampai di Lokasi'])
    expect(labels('dijemput', 'petugas')).toEqual(['Selesaikan'])
    expect(labels('dijadwalkan', 'pemerintah')).toEqual([])
  })
})
