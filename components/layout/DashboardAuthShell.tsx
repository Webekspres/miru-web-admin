'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  canAccessRoute,
  getLandingPathForRole,
} from '@/lib/routes'
import { buildLoginUrl } from '@/lib/session'
import { useAuth } from '@/providers/AuthProvider'
import { CardSkeleton } from '@/components/feedback/LoadingSkeleton'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export interface DashboardAuthShellProps {
  children: ReactNode
}

export function DashboardAuthShell({ children }: DashboardAuthShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, status, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (status === 'loading') return

    if (!isAuthenticated) {
      router.replace(buildLoginUrl(pathname))
      return
    }
  }, [status, isAuthenticated, router, pathname])

  useEffect(() => {
    if (status === 'loading' || !role) return

    if (!canAccessRoute(role, pathname)) {
      router.replace(getLandingPathForRole(role))
    }
  }, [status, role, pathname, router])

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  if (status === 'loading' || !isAuthenticated || !user || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted p-6">
        <CardSkeleton className="w-full max-w-md" />
      </div>
    )
  }

  return (
    <DashboardLayout
      role={role}
      user={{
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        role,
        avatar_url: user.avatar_url,
      }}
      onLogout={handleLogout}
    >
      {children}
    </DashboardLayout>
  )
}
