'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getProfilePathForRole } from '@/lib/routes'
import { ROLE_LABELS, type WebAdminRole } from '@/lib/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export interface ProfileDropdownProps {
  user: {
    id: number
    nama_lengkap: string
    role: WebAdminRole
  }
  onLogout?: () => void
  className?: string
}

export function ProfileDropdown({ user, onLogout, className }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const profilePath = getProfilePathForRole(user.role)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-label="Menu profil"
        aria-expanded={open}
        aria-haspopup="true"
        className="gap-2"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="size-3.5" aria-hidden />
        </span>
        <span className="hidden max-w-32 truncate sm:inline">
          {user.nama_lengkap}
        </span>
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium text-foreground">
              {user.nama_lengkap}
            </p>
            <Badge variant="primary" className="mt-1">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>

          <div className="p-1">
            <Link
              href={profilePath}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted"
            >
              <User className="size-4 text-muted-foreground" aria-hidden />
              Profil
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onLogout?.()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/5"
            >
              <LogOut className="size-4" aria-hidden />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
