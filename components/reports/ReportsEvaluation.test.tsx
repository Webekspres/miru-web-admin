import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SWRConfig } from 'swr'
import { ReportsClient } from '@/components/reports/ReportsClient'
import { WilayahTeraktifCard } from '@/components/dashboard/DashboardClient'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/reports',
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), upload: vi.fn(), download: vi.fn() } }
})

import { api } from '@/lib/api'

const tonase = [{ kategori_id: 1, nama: 'Plastik PET', total_berat_kg: '35.50', total_nilai: '106500.00' }]

const evaluation = {
  periode: { mulai: '2026-09-01', selesai: '2026-09-29' },
  jumlah_nasabah_terdaftar: 180,
  jumlah_nasabah_aktif: 42,
  nasabah_baru: 7,
  jumlah_transaksi: 120,
  total_sampah_kg: '350.00',
  total_nilai_setoran: '900000.00',
  total_penarikan: '200000.00',
  jumlah_reward_ditukar: 3,
  total_poin_ditukar: 150,
  wilayah_teraktif: [{ kelurahan: 'Kwamki', jumlah_nasabah_aktif: 12 }],
  kendala: { total_pengaduan: 4, per_jenis: [{ jenis: 'penjemputan', label: 'Penjemputan', jumlah: 4 }] },
  rekomendasi: ['Tambah jadwal jemput di Kwamki'],
  tonase_per_jenis: tonase,
}

function renderReports() {
  vi.mocked(api.get).mockImplementation(async (path: string) => {
    if (path.startsWith('/reports/evaluation/')) return evaluation
    return {
      tanggal: '2026-09-29', jumlah_transaksi: 1, total_setoran: '0', total_penarikan: '0',
      total_sampah_kg: '35.50', tonase_per_jenis: tonase,
    }
  })
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ReportsClient />
    </SWRConfig>,
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Reports', () => {
  it('shows category names in tonase tables', async () => {
    renderReports()
    expect(await screen.findByText('Plastik PET')).toBeInTheDocument()
  })

  it('evaluation tab shows kendala, wilayah, rekomendasi and exports Excel from the server', async () => {
    const user = userEvent.setup()
    renderReports()

    await user.click(screen.getByRole('tab', { name: /Evaluasi/ }))

    expect(await screen.findByText('Kendala (4 pengaduan)')).toBeInTheDocument()
    expect(screen.getByText('Kwamki')).toBeInTheDocument()
    expect(screen.getByText('Tambah jadwal jemput di Kwamki')).toBeInTheDocument()
    expect(screen.getByText('dari 180 terdaftar · 7 baru')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Excel/ }))
    expect(api.download).toHaveBeenCalledWith(
      '/reports/evaluation/export/',
      expect.stringMatching(/^laporan-evaluasi-.*\.xlsx$/),
      expect.objectContaining({ start: expect.any(String), end: expect.any(String) }),
    )
  })
})

describe('WilayahTeraktifCard', () => {
  it('lists kelurahan ranked by active nasabah', () => {
    render(
      <WilayahTeraktifCard
        items={[
          { kelurahan: 'Kwamki', jumlah_nasabah: 30 },
          { kelurahan: 'Nayaro', jumlah_nasabah: 12 },
        ]}
      />,
    )
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('1Kwamki30 nasabah')
    expect(items[1]).toHaveTextContent('2Nayaro12 nasabah')
  })

  it('explains an empty state', () => {
    render(<WilayahTeraktifCard items={[]} />)
    expect(screen.getByText('Belum ada nasabah aktif yang mengisi kelurahan.')).toBeInTheDocument()
  })
})
