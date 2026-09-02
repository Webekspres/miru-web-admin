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
      setTimeout(() => {
        setSidebarOpen(false)
      }, 0)
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Lewati ke konten utama
      </a>
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
        user={user}
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
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0">
          {children}
        </main>
        
        <footer className="print-hidden border-t border-border bg-background px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p>Copyright &copy; {new Date().getFullYear()} MIRU Bank Sampah. All rights reserved.</p>
            <p className="font-mono text-[11px] text-muted-foreground/80">Version 1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
