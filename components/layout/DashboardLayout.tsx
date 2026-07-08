'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { WebAdminRole } from '@/lib/navigation'
import { Header, type HeaderUser } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export interface DashboardLayoutProps {
  role: WebAdminRole
  user: HeaderUser
  onLogout?: () => void
  children: ReactNode
  className?: string
}

export function DashboardLayout({
  role,
  user,
  onLogout,
  children,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn('flex h-full min-h-screen bg-surface-muted', className)}>
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
