'use client'

import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/config'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { ProfileDropdown } from '@/components/layout/ProfileDropdown'
import { Button } from '@/components/ui/Button'
import type { WebAdminRole } from '@/lib/navigation'

export interface HeaderUser {
  id: number
  nama_lengkap: string
  role: WebAdminRole
}

export interface HeaderProps {
  user: HeaderUser
  onLogout?: () => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
  className?: string
}

export function Header({
  user,
  onLogout,
  sidebarOpen,
  onToggleSidebar,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'print-hidden fixed top-0 right-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 shadow-sm transition-[left] duration-200 ease-in-out sm:px-6',
        'left-0',
        sidebarOpen && 'lg:left-64',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
          className="border-border/80 hover:bg-surface-muted"
        >
          {sidebarOpen ? (
            <X className="size-4 text-foreground" aria-hidden />
          ) : (
            <Menu className="size-4 text-foreground" aria-hidden />
          )}
        </Button>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-foreground">
            {APP_NAME}
          </p>
          <p className="truncate text-xs text-muted-foreground font-medium">
            Panel Administrasi
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <NotificationBell userId={user.id} />

        <ProfileDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  )
}

