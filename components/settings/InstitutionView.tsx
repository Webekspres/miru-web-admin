'use client'

import useSWR from 'swr'
import { Clock, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { SettingsPageHeader } from '@/components/settings/SettingsPageHeader'
import type { InstitutionSettings } from '@/types/models'

export function InstitutionView() {
  const { role } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(
    '/settings/',
    (path) => api.get<InstitutionSettings>(path),
    { revalidateOnFocus: false },
  )

  if (isLoading) return <TableSkeleton rows={6} cols={2} />
  if (error || !data) {
    return (
      <ErrorMessage
        title="Gagal memuat data"
        message="Tidak dapat memuat pengaturan institusi."
        onRetry={() => mutate()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Institusi"
        description="Profil bank sampah yang tampil ke nasabah."
        editHref="/institution/edit"
        canEdit={role === 'admin'}
      />
      <Card>
        <CardContent className="space-y-4 p-4 text-sm">
          <Row label="Nama institusi" value={data.nama_institusi} />
          <Row label="Email" value={data.email || '—'} />
          <Row label="Kontak" value={data.kontak || '—'} />
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{data.alamat || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4 shrink-0" aria-hidden />
            <span>{data.jam_operasional || '—'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
