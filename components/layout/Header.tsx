'use client'

import { LogOut, User } from 'lucide-react'
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
  className?: string
}

export function Header({ user, onLogout, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6',
        className,
      )}
    >
      <div>
        <p className="text-sm font-semibold text-foreground">{APP_NAME}</p>
        <p className="text-xs text-muted-foreground">Panel administrasi</p>
      </div>

      <div className="flex items-center gap-3">
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
