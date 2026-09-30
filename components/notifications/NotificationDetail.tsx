'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR, { useSWRConfig } from 'swr'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatDateWIT } from '@/lib/format'
import { notifStyleFor, notifTargetFor } from '@/lib/notif-style'
import { useAuth } from '@/providers/AuthProvider'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Card } from '@/components/ui/Card'
import type { Notification } from '@/types/models'

/** Detail satu notifikasi; otomatis ditandai dibaca saat dibuka. */
export function NotificationDetail({ id }: { id: number }) {
  const { user, role } = useAuth()
  const { mutate: mutateGlobal } = useSWRConfig()
  const { data, error, isLoading, mutate } = useSWR(`/notifications/${id}/`, (path: string) =>
    api.get<Notification>(path),
  )

  useEffect(() => {
    if (!data || data.is_read) return
    api
      .post(`/notifications/${id}/read/`, {})
      .then(() => mutateGlobal(['notifications', user?.id]))
      .catch(() => {})
  }, [data, id, mutateGlobal, user?.id])

  const style = notifStyleFor(data?.kategori)
  const Icon = style.icon
  const target = notifTargetFor(data?.kategori, role)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/notifications"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Semua notifikasi
      </Link>

      {error ? (
        <ErrorMessage title="Notifikasi tidak ditemukan" message="Mungkin sudah dihapus." onRetry={() => mutate()} />
      ) : isLoading || !data ? (
        <LoadingSkeleton className="h-48" />
      ) : (
        <Card className="space-y-5 p-6">
          <div className="flex items-start gap-4">
            <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-full', style.tone)}>
              <Icon className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{style.label}</p>
              <h1 className="mt-1 text-xl font-semibold text-foreground">{data.judul}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateWIT(data.created_at, { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          <p className="whitespace-pre-line text-base leading-relaxed text-foreground">{data.deskripsi}</p>
          {target && (
            <Link
              href={target}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Buka halaman {style.label.toLowerCase()}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </Card>
      )}
    </div>
  )
}
