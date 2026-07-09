'use client'

import useSWR from 'swr'
import { api } from '@/lib/api'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import type { User } from '@/types/models'

export function CustomerEditClient({ customerId }: { customerId: number }) {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR(`/users/${customerId}/`, (path) => api.get<User>(path), {
    revalidateOnFocus: false,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={6} cols={1} />
      </div>
    )
  }

  if (error || !user) {
    return (
      <ErrorMessage
        title="Gagal memuat data"
        message="Tidak dapat memuat data nasabah. Pastikan ID benar dan koneksi tersedia."
        onRetry={() => mutate()}
      />
    )
  }

  return (
    <CustomerForm
      isEdit
      initialData={{
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        no_hp: user.no_hp,
        alamat: user.alamat,
        is_active: user.is_active,
      }}
    />
  )
}
