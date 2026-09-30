import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SWRConfig } from 'swr'

const items = [
  { id: 1, user: 9, judul: '💸 Penarikan saldo diajukan', deskripsi: 'Rp50.000 menunggu.', kategori: 'penarikan', is_read: false, created_at: '2026-09-30T02:00:00Z' },
  { id: 2, user: 9, judul: 'Penjemputan Baru', deskripsi: 'Ada pengajuan baru.', kategori: 'penjemputan', is_read: true, created_at: '2026-09-29T02:00:00Z' },
]

const auth = vi.hoisted(() => ({ role: 'admin' as string }))
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 9 }, role: auth.role }),
}))
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    items,
    unreadCount: 1,
    previewItems: items,
    isLoading: false,
    error: undefined,
    mutate: vi.fn(),
  }),
}))
vi.mock('@/components/feedback/Toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return { ...actual, api: { get: vi.fn(async () => items[0]), post: vi.fn(async () => ({})) } }
})

import { api } from '@/lib/api'
import { notifTargetFor } from '@/lib/notif-style'
import { NotificationsClient } from './NotificationsClient'
import { NotificationDetail } from './NotificationDetail'

const wrap = (ui: React.ReactNode) =>
  render(<SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>)

describe('notifications', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('links only to pages the role may open', () => {
    expect(notifTargetFor('penarikan', 'admin')).toBe('/balance')
    expect(notifTargetFor('penarikan', 'petugas')).toBeUndefined()
    expect(notifTargetFor('penjemputan', 'petugas')).toBe('/pickups')
    expect(notifTargetFor(undefined, 'admin')).toBeUndefined()
  })

  it('lists notifications and filters the unread ones', async () => {
    const user = userEvent.setup()
    wrap(<NotificationsClient />)
    expect(screen.getByText('Penjemputan Baru')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Penarikan saldo diajukan/ }).getAttribute('href')).toBe('/notifications/1')

    await user.click(screen.getByRole('tab', { name: /Belum dibaca/ }))
    expect(screen.queryByText('Penjemputan Baru')).toBeNull()
    expect(screen.getByText('💸 Penarikan saldo diajukan')).toBeTruthy()
  })

  it('opening a notification marks it read and offers the related page', async () => {
    wrap(<NotificationDetail id={1} />)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Penarikan saldo diajukan/ })).toBeTruthy())
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/notifications/1/read/', {}))
    expect(screen.getByRole('link', { name: /Buka halaman penarikan saldo/ }).getAttribute('href')).toBe('/balance')
  })
})
