'use client'

import { LogOut, Menu, User, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/config'
import { ROLE_LABELS, type WebAdminRole } from '@/lib/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export interface HeaderUser {
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
        'fixed top-0 right-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 transition-[left] duration-200 ease-in-out sm:px-6',
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
        >
          {sidebarOpen ? (
            <X className="size-4" aria-hidden />
          ) : (
            <Menu className="size-4" aria-hidden />
          )}
        </Button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {APP_NAME}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Panel administrasi
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-4" aria-hidden />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {user.nama_lengkap}
            </p>
            <Badge variant="primary" className="mt-0.5">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLogout}
          aria-label="Keluar"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  )
}
