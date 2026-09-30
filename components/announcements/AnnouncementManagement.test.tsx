import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SWRConfig } from 'swr'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})
vi.mock('@/components/feedback/Toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

import { api } from '@/lib/api'
import { AnnouncementManagement } from './AnnouncementManagement'

function renderPage() {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <AnnouncementManagement />
    </SWRConfig>,
  )
}

describe('AnnouncementManagement', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue([
      { id: 3, judul: 'Libur 17 Agustus', isi: 'Penjemputan libur.', aktif: true, tanggal: '2026-08-10T00:00:00Z' },
    ])
    vi.mocked(api.post).mockResolvedValue({})
    vi.mocked(api.patch).mockResolvedValue({})
  })
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('publishes an announcement that reaches the app', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByLabelText('Judul'), 'Harga PET naik')
    await user.type(screen.getByLabelText('Isi'), 'Mulai Senin harga PET Rp4.500/kg.')
    await user.click(screen.getByRole('button', { name: /Terbitkan/ }))

    expect(api.post).toHaveBeenCalledWith('/pengumuman/kelola/', {
      judul: 'Harga PET naik',
      isi: 'Mulai Senin harga PET Rp4.500/kg.',
      aktif: true,
    })
  })

  it('can hide an announcement from the app', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Libur 17 Agustus')).toBeTruthy())
    await user.click(screen.getByRole('button', { name: /Sembunyikan/ }))
    expect(api.patch).toHaveBeenCalledWith('/pengumuman/kelola/3/', { aktif: false })
  })
})
