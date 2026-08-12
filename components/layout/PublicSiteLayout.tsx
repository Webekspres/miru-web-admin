'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { PublicNavbar } from './PublicNavbar'
import { PublicFooter } from './PublicFooter'

export function PublicSiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Check if current route is a dashboard route or inside dashboard layout
  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/customers') ||
    pathname?.startsWith('/transactions') ||
    pathname?.startsWith('/pickups') ||
    pathname?.startsWith('/balance') ||
    pathname?.startsWith('/waste') ||
    pathname?.startsWith('/announcements') ||
    pathname?.startsWith('/reports') ||
    pathname?.startsWith('/education') ||
    pathname?.startsWith('/reward') ||
    pathname?.startsWith('/complaints') ||
    pathname?.startsWith('/warehouse') ||
    pathname?.startsWith('/staff') ||
    pathname?.startsWith('/audit-log') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/institution') ||
    pathname?.startsWith('/privacy') ||
    pathname?.startsWith('/about')

  if (isDashboardRoute) {
    return <>{children}</>
  }

  const isAuthPage = pathname === '/login' || pathname === '/forgot-password'

  return (
    <div
      className={
        isAuthPage
          ? 'flex h-dvh flex-col overflow-hidden bg-background text-foreground'
          : 'flex min-h-screen flex-col bg-background text-foreground'
      }
    >
      <PublicNavbar showSectionLinks={!isAuthPage} lockScroll={isAuthPage} />
      <main
        className={
          isAuthPage
            ? 'flex min-h-0 flex-1 flex-col overflow-y-auto'
            : 'flex-1'
        }
      >
        {children}
      </main>
      {!isAuthPage && <PublicFooter />}
    </div>
  )
}
