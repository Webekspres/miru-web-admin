import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SWRConfig } from 'swr'
import { ToastProvider } from '@/components/feedback/Toast'
import { CustomerDetail } from '@/components/customers/CustomerDetail'
import { CustomerForm } from '@/components/customers/CustomerForm'
import type { User } from '@/types/models'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}))

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ role: 'admin' }),
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

const baseNasabah: User = {
  id: 186,
  username: 'nasabah180',
  role: 'nasabah',
  nama_lengkap: 'Nasabah 180',
  no_hp: '08120000180',
  alamat: 'Kelurahan Timika Baru RT 00',
  kelurahan: 10,
  kelurahan_nama: 'Karangsari',
  is_active: true,
  saldo: '120000',
  poin: 120,
}

function wrap(ui: React.ReactNode) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ToastProvider>{ui}</ToastProvider>
    </SWRConfig>,
  )
}

function renderDetail(overrides: Partial<User>) {
  vi.mocked(api.get).mockImplementation(async (path: string) => {
    if (path === '/users/186/') return { ...baseNasabah, ...overrides }
    return []
  })
  return wrap(<CustomerDetail customerId={186} />)
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('CustomerDetail email card', () => {
  it('shows a verified email', async () => {
    renderDetail({ email: 'nasabah180@example.com', email_verified: true })

    expect(await screen.findByText('nasabah180@example.com')).toBeInTheDocument()
    expect(screen.getByText('Terverifikasi')).toBeInTheDocument()
  })

  it('warns when the email is not verified yet', async () => {
    renderDetail({ email: 'baru@gmail.com', email_verified: false })

    expect(await screen.findByText('baru@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('Belum verifikasi — akan diminta saat login.')).toBeInTheDocument()
  })

  it('explains admin-registered nasabah without email are exempt', async () => {
    renderDetail({ email: '', email_verified: false, email_exempt: true })

    expect(
      await screen.findByText('Tidak wajib — didaftarkan admin tanpa email.'),
    ).toBeInTheDocument()
  })
})

describe('CustomerForm email field', () => {
  it('sends the new email lowercased and warns about re-verification', async () => {
    const user = userEvent.setup()
    vi.mocked(api.get).mockResolvedValue([])
    vi.mocked(api.patch).mockResolvedValue({})
    wrap(
      <CustomerForm
        isEdit
        initialData={{
          id: 186,
          username: 'nasabah180',
          nama_lengkap: 'Nasabah 180',
          email: 'nasabah180@example.com',
          email_verified: true,
          is_active: true,
        }}
      />,
    )

    const email = screen.getByLabelText('Email (opsional)')
    expect(email).toHaveValue('nasabah180@example.com')
    await user.clear(email)
    await user.type(email, 'Budi.Baru@Gmail.com')
    expect(
      screen.getByText('Email diganti: nasabah harus memverifikasi ulang saat login berikutnya.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Simpan Perubahan/ }))

    await waitFor(() => expect(api.patch).toHaveBeenCalled())
    expect(vi.mocked(api.patch).mock.calls[0][0]).toBe('/users/186/')
    expect(vi.mocked(api.patch).mock.calls[0][1]).toMatchObject({ email: 'budi.baru@gmail.com' })
  })

  it('rejects an invalid email before submitting', async () => {
    const user = userEvent.setup()
    vi.mocked(api.get).mockResolvedValue([])
    wrap(
      <CustomerForm
        isEdit
        initialData={{ id: 186, username: 'nasabah180', nama_lengkap: 'Nasabah 180', is_active: true }}
      />,
    )

    await user.type(screen.getByLabelText('Email (opsional)'), 'bukan-email')
    await user.click(screen.getByRole('button', { name: /Simpan Perubahan/ }))

    expect(await screen.findByText('Format email tidak valid.')).toBeInTheDocument()
    expect(api.patch).not.toHaveBeenCalled()
  })

  it('omits email when adding a nasabah without one', async () => {
    const user = userEvent.setup()
    vi.mocked(api.get).mockResolvedValue([])
    vi.mocked(api.post).mockResolvedValue({})
    wrap(<CustomerForm />)

    await user.type(screen.getByLabelText('Username'), 'warga_lansia')
    await user.type(screen.getByLabelText('Password'), 'rahasia123')
    await user.type(screen.getByLabelText('Nama Lengkap'), 'Warga Lansia')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /Tambah Nasabah/ }))

    await waitFor(() => expect(api.post).toHaveBeenCalled())
    expect(vi.mocked(api.post).mock.calls[0][1]).not.toHaveProperty('email')
  })
})
