'use client'

import useSWR from 'swr'
import { api } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'
import { Card } from '@/components/ui/Card'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { SettingsPageHeader } from '@/components/settings/SettingsPageHeader'
import type { InstitutionSettings } from '@/types/models'

export function MarkdownDocView({
  title,
  description,
  field,
  editHref,
  publicHref,
}: {
  title: string
  description: string
  field: 'tentang' | 'kebijakan' | 'syarat_ketentuan'
  editHref: string
  publicHref?: string
}) {
  const { role } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(
    '/settings/',
    (path) => api.get<InstitutionSettings>(path),
    { revalidateOnFocus: false },
  )

  if (isLoading) return <TableSkeleton rows={8} cols={1} />
  if (error || !data) {
    return (
      <ErrorMessage
        title="Gagal memuat data"
        message="Tidak dapat memuat dokumen."
        onRetry={() => mutate()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title={title}
        description={description}
        editHref={editHref}
        publicHref={publicHref}
        canEdit={role === 'admin'}
      />
      <Card className="p-4 sm:p-6">
        <MarkdownContent source={data[field] || '_Belum ada konten._'} />
      </Card>
    </div>
  )
}
