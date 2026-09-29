import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

const auth = vi.hoisted(() => ({
  user: {
    username: 'admin',
    nama_lengkap: 'Admin MIRU',
    email: 'admin@mirubanksampah.id',
    email_verified: true,
    no_hp: '',
    alamat: '',
  } as Record<string, unknown>,
}))
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ user: auth.user, role: 'admin' }),
}))

import { ProfileClient } from './ProfileClient'

describe('ProfileClient', () => {
  afterEach(cleanup)

  it('shows the account email', () => {
    render(<ProfileClient />)
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByText('admin@mirubanksampah.id')).toBeTruthy()
    expect(screen.queryByText('Belum terverifikasi')).toBeNull()
  })

  it('flags an unverified email', () => {
    auth.user = { ...auth.user, email_verified: false }
    render(<ProfileClient />)
    expect(screen.getByText('Belum terverifikasi')).toBeTruthy()
  })
})
