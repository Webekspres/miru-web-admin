import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SWRConfig } from 'swr'
import { ToastProvider } from '@/components/feedback/Toast'
import { CustomerForm } from '@/components/customers/CustomerForm'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), upload: vi.fn() } }
})

import { api } from '@/lib/api'

function renderEdit() {
  vi.mocked(api.get).mockResolvedValue([])
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ToastProvider>
        <CustomerForm
          isEdit
          initialData={{ id: 7, username: 'warga', nama_lengkap: 'Warga Lama', is_active: true }}
        />
      </ToastProvider>
    </SWRConfig>,
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('CustomerForm unsaved changes', () => {
  it('leaves directly when nothing changed', async () => {
    const user = userEvent.setup()
    renderEdit()

    await user.click(screen.getByRole('button', { name: /Kembali/ }))

    expect(push).toHaveBeenCalledWith('/customers')
    expect(screen.queryByText('Perubahan belum disimpan')).not.toBeInTheDocument()
  })

  it('asks before leaving, "Tidak" discards and leaves', async () => {
    const user = userEvent.setup()
    renderEdit()

    await user.type(screen.getByLabelText('Nama Lengkap'), ' Baru')
    await user.click(screen.getByRole('button', { name: /Kembali/ }))

    expect(await screen.findByText('Perubahan belum disimpan')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Tidak' }))
    expect(push).toHaveBeenCalledWith('/customers')
    expect(api.patch).not.toHaveBeenCalled()
  })

  it('"Simpan" saves first, then leaves', async () => {
    const user = userEvent.setup()
    vi.mocked(api.patch).mockResolvedValue({})
    renderEdit()

    await user.type(screen.getByLabelText('Nama Lengkap'), ' Baru')
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    await user.click(await screen.findByRole('button', { name: 'Simpan' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/customers'))
    expect(vi.mocked(api.patch).mock.calls[0][1]).toMatchObject({ nama_lengkap: 'Warga Lama Baru' })
  })

  it('stays on the page when saving from the dialog fails validation', async () => {
    const user = userEvent.setup()
    renderEdit()

    await user.type(screen.getByLabelText('Email (opsional)'), 'bukan-email')
    await user.click(screen.getByRole('button', { name: /Kembali/ }))
    await user.click(await screen.findByRole('button', { name: 'Simpan' }))

    expect(await screen.findByText('Format email tidak valid.')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
    expect(screen.queryByText('Perubahan belum disimpan')).not.toBeInTheDocument()
  })

  it('intercepts internal link clicks while dirty', async () => {
    const user = userEvent.setup()
    renderEdit()
    const link = document.createElement('a')
    link.href = '/dashboard'
    link.textContent = 'Dashboard'
    document.body.appendChild(link)

    await user.type(screen.getByLabelText('Nama Lengkap'), 'x')
    await user.click(link)

    expect(await screen.findByText('Perubahan belum disimpan')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tidak' }))
    expect(push).toHaveBeenCalledWith('/dashboard')
    link.remove()
  })
})
