'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')

    function sync(event?: MediaQueryListEvent | MediaQueryList) {
      const matches = event?.matches ?? mq.matches
      setSidebarOpen(matches)
    }

    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setSidebarOpen(false)
    }
  }, [pathname])

  function toggleSidebar() {
    setSidebarOpen((open) => !open)
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className={cn('min-h-screen bg-surface-muted', className)}>
      {sidebarOpen && (
        <button
          type="button"
          className="print-hidden fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-label="Tutup menu navigasi"
        />
      )}

      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <div
        className={cn(
          'flex min-h-screen min-w-0 flex-col pt-16 transition-[margin] duration-200 ease-in-out',
          sidebarOpen ? 'lg:ml-64' : 'ml-0',
        )}
      >
        <Header
          user={user}
          onLogout={onLogout}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0">{children}</main>
      </div>
    </div>
  )
}
