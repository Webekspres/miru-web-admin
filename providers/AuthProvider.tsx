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
  getAccessToken,
  setTokens,
  TOKEN_KEYS,
} from '@/lib/api'
import {
  clearRoleCookie,
  setAccessTokenCookie,
  setRoleCookie,
} from '@/lib/auth-cookies'
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
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<WebAdminRole | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const logout = useCallback(() => {
    clearTokens()
    clearRoleCookie()
    setUser(null)
    setRole(null)
    setStatus('unauthenticated')
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
      setTokens(data.access, data.refresh)

      const webAdminRole = data.user.role as UserRole
      applyUser({
        id: data.user.id,
        username: data.user.username,
        role: webAdminRole,
        nama_lengkap: data.user.nama_lengkap,
        no_hp: data.user.no_hp,
        saldo: data.user.saldo,
        poin: data.user.poin,
        is_active: true,
      })

      return validateWebAdminRole(webAdminRole)
    },
    [applyUser],
  )

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const token = getAccessToken()
      if (!token) {
        if (!cancelled) setStatus('unauthenticated')
        return
      }

      setAccessTokenCookie(token)

      try {
        await refreshProfile()
      } catch {
        if (!cancelled) logout()
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [logout, refreshProfile])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === TOKEN_KEYS.access && !event.newValue) {
        setUser(null)
        setRole(null)
        setStatus('unauthenticated')
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

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
