'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { PublicNavbar } from './PublicNavbar'
import { PublicFooter } from './PublicFooter'

/** Full-bleed auth surfaces: no public navbar/footer, viewport-locked on desktop. */
const AUTH_SURFACES = ['/login', '/forgot-password', '/hapus-akun'] as const

function isAuthSurface(pathname: string | null): boolean {
  if (!pathname) return false
  return AUTH_SURFACES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

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
    pathname?.startsWith('/about') ||
    pathname?.startsWith('/syarat-ketentuan')

  if (isDashboardRoute) {
    return <>{children}</>
  }

  const authSurface = isAuthSurface(pathname)
  const isLogin = pathname === '/login'

  return (
    <div
      className={
        authSurface
          ? 'flex h-dvh flex-col overflow-hidden bg-background text-foreground'
          : 'flex min-h-screen flex-col bg-background text-foreground'
      }
    >
      {!authSurface && <PublicNavbar showSectionLinks />}
      <main
        className={
          authSurface
            ? isLogin
              ? 'flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden'
              : 'flex min-h-0 flex-1 flex-col overflow-y-auto'
            : 'flex-1'
        }
      >
        {children}
      </main>
      {!authSurface && <PublicFooter />}
    </div>
  )
}
