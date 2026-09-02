import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SWRConfig } from 'swr'
import { ToastProvider } from '@/components/feedback/Toast'
import { DepositForm } from '@/components/forms/DepositForm'
import type { WasteCategory } from '@/types/models'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}))

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: vi.fn(),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      upload: vi.fn(),
    },
  }
})

import { api } from '@/lib/api'

const categories: WasteCategory[] = [
  {
    id: 7,
    nama: 'Plastik PET',
    harga_beli_per_kg: '2000',
    stok_terkini_kg: '10',
  },
]

function renderForm() {
  vi.mocked(api.get).mockImplementation(async (path: string) => {
    if (path === '/waste-categories/') return categories
    if (path.startsWith('/users/')) return []
    return []
  })

  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ToastProvider>
        <DepositForm />
      </ToastProvider>
    </SWRConfig>,
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('DepositForm', () => {
  it('rejects weight below 1 kg', async () => {
    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('heading', { name: 'Input Setoran' })

    await user.selectOptions(screen.getByLabelText('Jenis Sampah'), '7')
    await user.type(screen.getByLabelText('Berat (kg)'), '0.5')
    await user.click(screen.getByRole('button', { name: /Simpan Setoran/i }))

    expect(await screen.findByText('Minimal 1 kg.')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('auto-calculates subtotal when berat is entered', async () => {
    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('heading', { name: 'Input Setoran' })

    await user.selectOptions(screen.getByLabelText('Jenis Sampah'), '7')
    await user.type(screen.getByLabelText('Berat (kg)'), '2')

    await waitFor(() => {
      expect(screen.getAllByText('Rp4.000,00').length).toBeGreaterThan(0)
    })
  })
})
