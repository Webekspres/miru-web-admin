import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SWRConfig } from 'swr'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    api: {
      get: vi.fn().mockResolvedValue([
        { id: 7, nama: 'PET', harga_beli_per_kg: '3000.00' },
      ]),
      post: vi.fn(),
    },
  }
})

import { SelesaikanPickupModal } from './SelesaikanPickupModal'
import type { Pickup } from '@/types/models'

const pickup = {
  id: 44,
  nasabah: 7,
  nasabah_nama: 'Budi Santoso',
  petugas: 3,
  estimasi_berat: '10.00',
  alamat_jemput: 'Timika',
  jadwal: '2026-09-30T08:00:00Z',
  status: 'dijemput',
} as Pickup

function renderModal(onSubmit = vi.fn()) {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <SelesaikanPickupModal pickup={pickup} onClose={() => {}} onSubmit={onSubmit} loading={false} />
    </SWRConfig>,
  )
  return onSubmit
}

describe('SelesaikanPickupModal', () => {
  afterEach(cleanup)

  it('requires a weighed waste type before completing', async () => {
    const user = userEvent.setup()
    const onSubmit = renderModal()
    await user.click(screen.getByRole('button', { name: /Simpan & Selesaikan/ }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Pilih jenis sampah.')).toBeTruthy()
  })

  it('sends the weighed details and shows the value going to saldo', async () => {
    const user = userEvent.setup()
    const onSubmit = renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: /PET/ })).toBeTruthy())

    await user.selectOptions(screen.getByLabelText('Jenis Sampah'), '7')
    await user.type(screen.getByLabelText('Berat (kg)'), '4')
    expect(screen.getByText(/Masuk ke saldo:/).textContent).toMatch(/12\.000/)

    await user.click(screen.getByRole('button', { name: /Simpan & Selesaikan/ }))
    expect(onSubmit).toHaveBeenCalledWith([{ kategori: 7, berat_kg: 4 }])
  })

  it('prefills the waste type and estimated weight from the request', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <SelesaikanPickupModal
          pickup={{ ...pickup, kategori: 7, kategori_nama: 'PET', estimasi_berat: '12.00' }}
          onClose={() => {}}
          onSubmit={onSubmit}
          loading={false}
        />
      </SWRConfig>,
    )
    await waitFor(() => expect(screen.getByText(/Masuk ke saldo:/).textContent).toMatch(/36\.000/))
    expect((screen.getByLabelText('Berat (kg)') as HTMLInputElement).value).toBe('12')

    await user.click(screen.getByRole('button', { name: /Simpan & Selesaikan/ }))
    expect(onSubmit).toHaveBeenCalledWith([{ kategori: 7, berat_kg: 12 }])
  })
})
