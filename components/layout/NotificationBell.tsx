'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDateWIT } from '@/lib/format'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}

export interface NotificationBellProps {
  userId: number
  className?: string
}

export function NotificationBell({ userId, className }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { previewItems, unreadCount, isLoading, mutate } = useNotifications(userId)

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

  async function handleMarkRead(id: number) {
    await api.post(`/notifications/${id}/read/`, {})
    await mutate()
  }

  async function handleMarkAllRead() {
    await api.post('/notifications/mark-all-read/', {})
    await mutate()
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifikasi"
        aria-expanded={open}
        aria-haspopup="true"
        className="relative"
      >
        <Bell className="size-4" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-lg sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifikasi</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <CheckCheck className="size-3.5" aria-hidden />
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Memuat notifikasi...
              </p>
            ) : previewItems.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Belum ada notifikasi.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {previewItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        if (!item.is_read) void handleMarkRead(item.id)
                      }}
                      className={cn(
                        'w-full px-4 py-3 text-left transition-colors hover:bg-surface-muted',
                        !item.is_read && 'bg-primary/5',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!item.is_read && (
                          <span
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                            aria-hidden
                          />
                        )}
                        <div className={cn('min-w-0 flex-1', item.is_read && 'pl-4')}>
                          <p className="text-sm font-medium text-foreground">
                            {item.judul}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {truncateText(item.deskripsi, 80)}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {formatDateWIT(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
