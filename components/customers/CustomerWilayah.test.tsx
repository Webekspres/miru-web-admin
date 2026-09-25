import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { ToastProvider } from '@/components/feedback/Toast'
import { CustomerForm } from '@/components/customers/CustomerForm'
import type { WilayahCakupan } from '@/types/models'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), upload: vi.fn() } }
})

import { api } from '@/lib/api'

const cakupan: WilayahCakupan = {
  provinsi: { kode: '94', nama: 'Papua Tengah' },
  kabupaten: { kode: '94.04', nama: 'Kabupaten Mimika' },
  distrik: { kode: '94.04.01', nama: 'Mimika Baru' },
  kelurahan: [
    { id: 2, kode: '94.04.01.1002', nama: 'Kwamki', jenis: 'kelurahan' },
    { id: 12, kode: '94.04.01.2004', nama: 'Nayaro', jenis: 'kampung' },
  ],
  pesan: 'MIRU Bank Sampah hanya melayani warga Distrik Mimika Baru, Kabupaten Mimika, Papua Tengah.',
}

function renderForm(initialKelurahan?: number) {
  vi.mocked(api.get).mockImplementation(async (path: string) =>
    path === '/wilayah/cakupan/' ? cakupan : [],
  )
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ToastProvider>
        <CustomerForm
          isEdit={initialKelurahan !== undefined}
          initialData={
            initialKelurahan === undefined
              ? undefined
              : { id: 5, username: 'warga', nama_lengkap: 'Warga', kelurahan: initialKelurahan, is_active: true }
          }
        />
      </ToastProvider>
    </SWRConfig>,
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('CustomerForm wilayah Mimika Baru', () => {
  it('locks provinsi/kabupaten/distrik and lists only served kelurahan', async () => {
    renderForm()

    expect(await screen.findByDisplayValue('Kabupaten Mimika')).toBeDisabled()
    expect(screen.getByDisplayValue('Papua Tengah')).toBeDisabled()
    expect(screen.getByDisplayValue('Mimika Baru')).toBeDisabled()
    expect(screen.getByText(cakupan.pesan)).toBeInTheDocument()

    const select = screen.getByLabelText('Kelurahan / Kampung')
    const labels = within(select).getAllByRole('option').map((o) => o.textContent)
    expect(labels).toEqual(['— Belum dipilih —', 'Kelurahan Kwamki', 'Kampung Nayaro'])
  })

  it('asks to re-pick a kelurahan that is no longer served', async () => {
    renderForm(99)

    expect(await screen.findByText('Kelurahan lama tidak dilayani. Pilih ulang.')).toBeInTheDocument()
  })
})
