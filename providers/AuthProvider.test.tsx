import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/providers/AuthProvider'
import { NASABAH_LOGIN_MESSAGE } from '@/lib/auth'
import { TOKEN_KEYS } from '@/lib/auth-constants'
import { ApiError } from '@/types/api'
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
  getCsrfToken: vi.fn(),
  clearCsrfToken: vi.fn(),
  setRoleCookie: vi.fn(),
  clearRoleCookie: vi.fn(),
}))

import { api } from '@/lib/api'
import { setRoleCookie } from '@/lib/auth-cookies'

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

function noSessionError(): ApiError {
  return new ApiError('Sesi tidak valid.', 401, 'AUTHENTICATION_FAILED')
}

beforeEach(() => {
  // revokeSession (logout) memakai fetch langsung — netralkan supaya test
  // tidak pernah mencoba koneksi jaringan sungguhan.
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('AuthProvider', () => {
  it('starts unauthenticated when /auth/me/ has no server session', async () => {
    vi.mocked(api.get).mockRejectedValue(noSessionError())

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

  it('restores session from /auth/me/ cookies', async () => {
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
    expect(api.get).toHaveBeenCalledWith('/auth/me/', undefined, { skipAuth: true })
  })

  it('restores session via one refresh round-trip when access cookie expired', async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce(noSessionError())
      .mockResolvedValueOnce({
        id: 3,
        username: 'koordinator1',
        role: 'koordinator',
        nama_lengkap: 'Koordinator Satu',
        is_active: true,
      } satisfies Partial<User>)
    vi.mocked(api.post).mockResolvedValueOnce({ access: 'renewed.access.token' })

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('koordinator')
    })
    expect(api.post).toHaveBeenCalledWith('/auth/refresh/', {}, { skipAuth: true })
  })

  it('rejects nasabah login and does not mark any session', async () => {
    vi.mocked(api.get).mockRejectedValue(noSessionError())
    vi.mocked(api.post)
      .mockRejectedValueOnce(noSessionError())
      .mockResolvedValueOnce(staffLogin('nasabah'))

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
    expect(setRoleCookie).not.toHaveBeenCalled()
    expect(localStorage.getItem(TOKEN_KEYS.access)).toBeNull()
  })

  it('sets role cookie as session marker for admin login (no localStorage token)', async () => {
    vi.mocked(api.get).mockRejectedValue(noSessionError())
    vi.mocked(api.post)
      .mockRejectedValueOnce(noSessionError())
      .mockResolvedValueOnce(staffLogin('admin'))

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
    expect(setRoleCookie).toHaveBeenCalledWith('admin')
    expect(localStorage.getItem(TOKEN_KEYS.access)).toBeNull()
    expect(localStorage.getItem(TOKEN_KEYS.refresh)).toBeNull()
  })
})

describe('nasabah gate message', () => {
  it('uses the mobile-app copy', () => {
    expect(NASABAH_LOGIN_MESSAGE).toMatch(/aplikasi mobile MIRU/)
  })
})