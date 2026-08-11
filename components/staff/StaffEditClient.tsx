'use client'

import useSWR from 'swr'
import { api } from '@/lib/api'
import { StaffForm } from '@/components/staff/StaffForm'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import type { StaffRole, User } from '@/types/models'

export function StaffEditClient({ staffId }: { staffId: number }) {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR(`/users/${staffId}/`, (path) => api.get<User>(path), {
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
        message="Tidak dapat memuat data staff. Pastikan ID benar dan koneksi tersedia."
        onRetry={() => mutate()}
      />
    )
  }

  // Validate role is a staff role
  const staffRoles: StaffRole[] = ['petugas', 'admin', 'koordinator']

  if (!staffRoles.includes(user.role as StaffRole)) {
    return (
      <ErrorMessage
        title="Data tidak valid"
        message={`User dengan role "${user.role}" tidak dapat diedit di halaman ini.`}
      />
    )
  }

  return (
    <StaffForm
      isEdit
      initialData={{
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        no_hp: user.no_hp,
        role: user.role as StaffRole,
        is_active: user.is_active,
      }}
    />
  )
}
