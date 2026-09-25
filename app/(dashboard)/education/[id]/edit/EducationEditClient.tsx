'use client'

import useSWR from 'swr'
import { api } from '@/lib/api'
import { EducationForm } from '@/components/education/EducationForm'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import type { KontenEdukasi } from '@/types/models'

export function EducationEditClient({ articleId }: { articleId: number }) {
  const {
    data: article,
    error,
    isLoading,
    mutate,
  } = useSWR(`/edukasi/${articleId}/`, (path) => api.get<KontenEdukasi>(path), {
    revalidateOnFocus: false,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <TableSkeleton rows={8} cols={1} />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <ErrorMessage
          title="Gagal memuat artikel"
          message="Tidak dapat memuat data artikel edukasi. Pastikan ID artikel benar dan koneksi tersedia."
          onRetry={() => mutate()}
        />
      </div>
    )
  }

  return <EducationForm isEdit initialData={article} />
}
