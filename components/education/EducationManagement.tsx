'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatDateWIT } from '@/lib/format'
import { canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  Edit,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react'
import type { KontenEdukasi } from '@/types/models'

export function EducationManagement() {
  const { role: authRole } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const canWrite = authRole ? canMutate(authRole) : false

  // ── Data ──
  const {
    data: items,
    error: fetchError,
    isLoading: fetchLoading,
    mutate: fetchMutate,
  } = useSWR('/edukasi/', (path) => api.get<KontenEdukasi[]>(path), {
    revalidateOnFocus: true,
  })

  const list = items ?? []
  const [deleteConfirm, setDeleteConfirm] = useState<KontenEdukasi | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // ── Delete ──
  async function handleDelete() {
    if (!deleteConfirm) return
    setDeleteSubmitting(true)
    try {
      await api.delete(`/edukasi/${deleteConfirm.id}/`)
      toastSuccess('Artikel edukasi berhasil dihapus.')
      setDeleteConfirm(null)
      fetchMutate()
    } catch {
      toastError('Gagal menghapus artikel edukasi.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  // ── Loading / Error ──
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edukasi Sampah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola artikel dan panduan pemilahan sampah untuk nasabah.
          </p>
        </div>
        <TableSkeleton rows={8} cols={5} />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edukasi Sampah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola artikel dan panduan pemilahan sampah untuk nasabah.
          </p>
        </div>
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat data edukasi. Periksa koneksi ke server." onRetry={() => fetchMutate()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edukasi Sampah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola artikel dan panduan pemilahan sampah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Link href="/education/add">
              <Button type="button" className="gap-1.5 font-semibold">
                <Plus className="size-4" aria-hidden />
                Tambah Artikel Baru
              </Button>
            </Link>
          )}
          <Button type="button" variant="ghost" onClick={() => fetchMutate()} disabled={fetchLoading}>
            <FileText className="size-4" aria-hidden />
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Tabel Artikel */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artikel</TableHead>
                <TableHead>Kategori Terkait</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diperbarui</TableHead>
                {canWrite && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableEmpty
                  colSpan={canWrite ? 5 : 4}
                  message="Belum ada artikel edukasi. Tambahkan artikel baru."
                />
              ) : (
                list.map((item) => {
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <span className="line-clamp-1 font-semibold text-foreground">{item.judul}</span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {item.isi
                              .replace(/[#*_`>~\[\]]/g, '')
                              .replace(/\s+/g, ' ')
                              .trim()
                              .slice(0, 80)}
                            {item.isi.length > 80 ? '…' : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.kategori_terkait_nama ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.aktif ? 'success' : 'default'}>
                          {item.aktif ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateWIT(item.updated_at, { dateStyle: 'medium' })}
                      </TableCell>
                      {canWrite && (
                        <TableCell>
                          <div className="flex justify-end gap-1.5">
                            <Link href={`/education/${item.id}/edit`}>
                              <Button type="button" variant="ghost" size="sm" className="gap-1 font-semibold">
                                <Edit className="size-4" aria-hidden />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-danger hover:text-danger hover:bg-danger/10"
                              onClick={() => setDeleteConfirm(item)}
                            >
                              <Trash2 className="size-4" aria-hidden />
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Artikel Edukasi"
        description="Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan."
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleteSubmitting}>
              Batal
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} loading={deleteSubmitting} disabled={deleteSubmitting}>
              <Trash2 className="size-4" aria-hidden />
              Hapus Artikel
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Artikel akan hilang dari aplikasi mobile nasabah setelah dihapus.
        </p>
      </Modal>
    </div>
  )
}
