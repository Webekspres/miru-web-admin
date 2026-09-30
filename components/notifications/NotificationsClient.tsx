'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCheck, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatDateWIT } from '@/lib/format'
import { notifStyleFor } from '@/lib/notif-style'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Filter = 'semua' | 'belum'

export function NotificationsClient() {
  const { user } = useAuth()
  const { items, unreadCount, isLoading, error, mutate } = useNotifications(user?.id)
  const { success: toastSuccess, error: toastError } = useToast()
  const [filter, setFilter] = useState<Filter>('semua')

  const shown = filter === 'belum' ? items.filter((n) => !n.is_read) : items

  async function tandaiSemua() {
    try {
      await api.post('/notifications/mark-all-read/', {})
      await mutate()
      toastSuccess('Semua notifikasi ditandai dibaca.')
    } catch {
      toastError('Gagal menandai notifikasi.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notifikasi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={tandaiSemua}>
            <CheckCheck className="size-4" aria-hidden />
            Tandai semua dibaca
          </Button>
        )}
      </div>

      <div className="flex gap-1" role="tablist" aria-label="Filter notifikasi">
        {(['semua', 'belum'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors',
              filter === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {key === 'semua' ? 'Semua' : `Belum dibaca${unreadCount ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        {error ? (
          <div className="p-4">
            <ErrorMessage title="Gagal memuat notifikasi" message="Coba muat ulang." onRetry={() => mutate()} />
          </div>
        ) : isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} cols={1} />
          </div>
        ) : shown.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            {filter === 'belum' ? 'Tidak ada notifikasi yang belum dibaca. 🎉' : 'Belum ada notifikasi.'}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {shown.map((item) => {
              const style = notifStyleFor(item.kategori)
              const Icon = style.icon
              return (
                <li key={item.id}>
                  <Link
                    href={`/notifications/${item.id}`}
                    className={cn(
                      'flex items-start gap-3 px-4 py-4 transition-colors hover:bg-surface-muted',
                      !item.is_read && 'bg-primary/5',
                    )}
                  >
                    <span className={cn('relative flex size-10 shrink-0 items-center justify-center rounded-full', style.tone)}>
                      <Icon className="size-5" aria-hidden />
                      {!item.is_read && (
                        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-background bg-primary" aria-label="Belum dibaca" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-sm text-foreground', !item.is_read ? 'font-semibold' : 'font-medium')}>
                        {item.judul}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{item.deskripsi}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {style.label} · {formatDateWIT(item.created_at, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </span>
                    <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
