import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '@/types/api'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

const refreshProfile = vi.fn()
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { nama_lengkap: 'Petugas Satu', email: '' }, refreshProfile }),
}))

import { api } from '@/lib/api'
import { VerifyEmailGate } from './VerifyEmailGate'

describe('VerifyEmailGate', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
    refreshProfile.mockReset()
  })
  afterEach(cleanup)

  it('sends OTP to email, then verifies and refreshes the profile', async () => {
    const user = userEvent.setup()
    vi.mocked(api.post)
      .mockResolvedValueOnce({ masked_email: 'pe***@gmail.com' })
      .mockResolvedValueOnce({ email_verified: true })
    render(<VerifyEmailGate onLogout={vi.fn()} />)

    await user.type(screen.getByLabelText('Email'), 'petugas@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Kirim Kode OTP' }))
    expect(api.post).toHaveBeenCalledWith('/auth/email/request-otp/', { email: 'petugas@gmail.com' })
    expect(await screen.findByText('pe***@gmail.com')).toBeTruthy()

    const verify = screen.getByRole('button', { name: 'Verifikasi' })
    expect(verify).toHaveProperty('disabled', true)
    await user.type(screen.getByLabelText('Kode OTP'), '12a3456')
    await user.click(verify)
    expect(api.post).toHaveBeenLastCalledWith('/auth/email/verify-otp/', { otp: '123456' })
    await waitFor(() => expect(refreshProfile).toHaveBeenCalled())
  })

  it('shows server error for rejected email', async () => {
    const user = userEvent.setup()
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError('Data tidak valid.', 400, 'VALIDATION_ERROR', {
        email: ['Email sudah dipakai akun lain.'],
      }),
    )
    render(<VerifyEmailGate onLogout={vi.fn()} />)
    await user.type(screen.getByLabelText('Email'), 'dipakai@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Kirim Kode OTP' }))
    expect(await screen.findByText('Data tidak valid.')).toBeTruthy()
    expect(screen.getByText('Email sudah dipakai akun lain.')).toBeTruthy()
    expect(refreshProfile).not.toHaveBeenCalled()
  })
})
