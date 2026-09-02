import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/providers/AuthProvider'
import { NASABAH_LOGIN_MESSAGE } from '@/lib/auth'
import { TOKEN_KEYS } from '@/lib/auth-constants'
import type { LoginResponse } from '@/types/api'
import type { User } from '@/types/models'

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

vi.mock('@/lib/auth-cookies', () => ({
  setAccessTokenCookie: vi.fn(),
  setRoleCookie: vi.fn(),
  clearAccessTokenCookie: vi.fn(),
  clearRoleCookie: vi.fn(),
}))

import { api } from '@/lib/api'

function AuthProbe() {
  const { status, role, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="role">{role ?? 'none'}</p>
      <p data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</p>
      <button type="button" onClick={() => void login('admin', 'secret').catch(() => undefined)}>
        Login
      </button>
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  )
}

function staffLogin(role: LoginResponse['user']['role']): LoginResponse {
  return {
    access: 'header.payload.signature',
    refresh: 'refresh.token.value',
    user: {
      id: 1,
      username: 'admin',
      role,
      nama_lengkap: 'Admin MIRU',
      no_hp: '0812',
      saldo: '0',
      poin: 0,
      avatar_url: null,
    },
  }
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

describe('AuthProvider', () => {
  it('starts unauthenticated when no token is stored', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('unauthenticated')
    })
    expect(screen.getByTestId('auth').textContent).toBe('no')
  })

  it('restores session from /auth/me/', async () => {
    localStorage.setItem(TOKEN_KEYS.access, 'stored-token')
    vi.mocked(api.get).mockResolvedValueOnce({
      id: 2,
      username: 'petugas1',
      role: 'petugas',
      nama_lengkap: 'Petugas Satu',
      is_active: true,
    } satisfies Partial<User>)

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('authenticated')
    })
    expect(screen.getByTestId('role').textContent).toBe('petugas')
    expect(api.get).toHaveBeenCalledWith('/auth/me/')
  })

  it('rejects nasabah login and does not keep tokens', async () => {
    vi.mocked(api.post).mockResolvedValueOnce(staffLogin('nasabah'))

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('unauthenticated')
    })

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('no')
    })
    expect(localStorage.getItem(TOKEN_KEYS.access)).toBeNull()
  })

  it('stores tokens for admin login', async () => {
    vi.mocked(api.post).mockResolvedValueOnce(staffLogin('admin'))

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('unauthenticated')
    })

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('admin')
    })
    expect(localStorage.getItem(TOKEN_KEYS.access)).toBe('header.payload.signature')
  })
})

describe('nasabah gate message', () => {
  it('uses the mobile-app copy', () => {
    expect(NASABAH_LOGIN_MESSAGE).toMatch(/aplikasi mobile MIRU/)
  })
})
