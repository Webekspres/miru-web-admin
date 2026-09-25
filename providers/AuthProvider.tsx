'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  api,
  clearTokens,
  revokeSession,
} from '@/lib/api'
import { setRoleCookie } from '@/lib/auth-cookies'
import { validateWebAdminRole } from '@/lib/auth'
import type { WebAdminRole } from '@/lib/routes'
import type { LoginResponse } from '@/types/api'
import type { User, UserRole } from '@/types/models'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  user: User | null
  role: WebAdminRole | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<WebAdminRole>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<WebAdminRole | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const logout = useCallback(async () => {
    // Token HttpOnly tidak bisa dihapus lewat JS — minta backend membatalkan
    // sesi (blacklist refresh + hapus cookie) lalu bersihkan marker lokal.
    try {
      await revokeSession()
    } finally {
      clearTokens()
      setUser(null)
      setRole(null)
      setStatus('unauthenticated')
    }
  }, [])

  const applyUser = useCallback((nextUser: User) => {
    const webAdminRole = validateWebAdminRole(nextUser.role)
    setUser(nextUser)
    setRole(webAdminRole)
    setRoleCookie(webAdminRole)
    setStatus('authenticated')
  }, [])

  const refreshProfile = useCallback(async () => {
    const profile = await api.get<User>('/auth/me/')
    applyUser(profile)
  }, [applyUser])

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await api.post<LoginResponse>(
        '/auth/login/',
        { username, password },
        { skipAuth: true },
      )

      validateWebAdminRole(data.user.role as UserRole)
      // Token access/refresh disimpan backend sebagai cookie HttpOnly —
      // web admin cukup membawa cookie, tidak perlu menyimpan token di JS.

      const webAdminRole = data.user.role as UserRole
      applyUser({
        id: data.user.id,
        username: data.user.username,
        role: webAdminRole,
        nama_lengkap: data.user.nama_lengkap,
        no_hp: data.user.no_hp,
        email: data.user.email,
        email_verified: data.user.email_verified,
        email_required: data.user.email_required,
        saldo: data.user.saldo,
        poin: data.user.poin,
        is_active: true,
        avatar_url: data.user.avatar_url,
      })

      return validateWebAdminRole(webAdminRole)
    },
    [applyUser],
  )

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const profile = await api.get<User>('/auth/me/', undefined, { skipAuth: true })
        if (cancelled) return
        applyUser(profile)
        return
      } catch {
        // Access cookie basi/kedaluwarsa — coba refresh satu kali lewat cookie.
      }

      try {
        await api.post('/auth/refresh/', {}, { skipAuth: true })
        const profile = await api.get<User>('/auth/me/', undefined, { skipAuth: true })
        if (cancelled) return
        applyUser(profile)
      } catch {
        if (!cancelled) logout()
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [logout, applyUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      status,
      isAuthenticated: status === 'authenticated' && user !== null && role !== null,
      login,
      logout,
      refreshProfile,
    }),
    [user, role, status, login, logout, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider')
  }
  return context
}
