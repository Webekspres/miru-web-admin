'use client'

import { useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { api, ApiError } from '@/lib/api'
import { formatDateWIT, formatRupiah, formatWeightKg } from '@/lib/format'
import { canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  AlertTriangle,
  DollarSign,
  Edit,
  FileText,
  History,
  Package,
  Plus,
  Scale,
  Trash2,
} from 'lucide-react'
import type { WasteCategory } from '@/types/models'

// ─── Constants ────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD_KG = 10

// ─── Types ────────────────────────────────────────────────────────

interface PriceHistoryItem {
  id: number
  harga_lama: string
  harga_baru: string
  tanggal_berlaku: string
  diubah_oleh: { id: number; username: string; nama_lengkap?: string } | null
}

interface FormState {
  id: number | null
  nama: string
  harga_beli_per_kg: string
}

interface FormErrors {
  nama?: string
  harga_beli_per_kg?: string
  _general?: string
}

// ─── Helpers ──────────────────────────────────────────────────────

function getStockBadge(stokKg: number) {
  if (stokKg === 0) return 'danger' as const
  if (stokKg < LOW_STOCK_THRESHOLD_KG) return 'warning' as const
  return 'success' as const
}

function getStockLabel(stokKg: number): string {
  if (stokKg === 0) return 'Habis'
  if (stokKg < LOW_STOCK_THRESHOLD_KG) return 'Menipis'
  return 'Tersedia'
}

// ─── Price History Modal ──────────────────────────────────────────

function PriceHistoryModal({
  categoryId,
  categoryName,
  open,
  onClose,
}: {
  categoryId: number
  categoryName: string
  open: boolean
  onClose: () => void
}) {
  const { data, error, isLoading, mutate } = useSWR(
    open ? `/waste-categories/${categoryId}/price-history/` : null,
    (path) => api.get<PriceHistoryItem[]>(path),
    { revalidateOnFocus: false },
  )

  const items = data ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Riwayat Harga: ${categoryName}`}
      description="Catatan perubahan harga beli per kilogram."
      size="md"
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : error ? (
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat riwayat harga." onRetry={() => mutate()} />
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Belum ada perubahan harga untuk kategori ini.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Harga Lama</TableHead>
                <TableHead className="text-right">Harga Baru</TableHead>
                <TableHead>Diubah Oleh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const lama = parseFloat(item.harga_lama)
                const baru = parseFloat(item.harga_baru)
                const naik = baru > lama
                const turun = baru < lama
                return (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">{formatDateWIT(item.tanggal_berlaku, { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatRupiah(item.harga_lama)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={naik ? 'text-success' : turun ? 'text-danger' : ''}>
                        {formatRupiah(item.harga_baru)}
                        {naik && ' ↑'}
                        {turun && ' ↓'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.diubah_oleh?.nama_lengkap ?? item.diubah_oleh?.username ?? '-'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function WasteCategoryList() {
  const { role: authRole } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const { mutate: globalMutate } = useSWRConfig()

  const canWrite = authRole ? canMutate(authRole) : false

  // ── Fetch categories ──
  const {
    data: categories,
    error: fetchError,
    isLoading: fetchLoading,
    mutate: fetchMutate,
  } = useSWR(
    '/waste-categories/',
    (path) => api.get<WasteCategory[]>(path),
    { revalidateOnFocus: true },
  )

  const categoryList = categories ?? []

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState<FormState>({
    id: null,
    nama: '',
    harga_beli_per_kg: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // ── Price history modal state ──
  const [priceHistoryTarget, setPriceHistoryTarget] = useState<{ id: number; nama: string } | null>(null)

  // ── Open modal for add ──
  function handleAdd() {
    setFormData({ id: null, nama: '', harga_beli_per_kg: '' })
    setFormErrors({})
    setModalOpen(true)
  }

  // ── Open modal for edit ──
  function handleEdit(cat: WasteCategory) {
    setFormData({
      id: cat.id,
      nama: cat.nama,
      harga_beli_per_kg: cat.harga_beli_per_kg,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  // ── Validation ──
  function validate(): boolean {
    const errs: FormErrors = {}
    let valid = true

    if (!formData.nama.trim()) {
      errs.nama = 'Nama kategori wajib diisi.'
      valid = false
    }

    const harga = parseFloat(formData.harga_beli_per_kg)
    if (!formData.harga_beli_per_kg || isNaN(harga) || harga <= 0) {
      errs.harga_beli_per_kg = 'Harga harus lebih dari Rp0.'
      valid = false
    }

    setFormErrors(errs)
    return valid
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!validate()) return

    setSubmitting(true)

    const payload = {
      nama: formData.nama.trim(),
      harga_beli_per_kg: parseFloat(formData.harga_beli_per_kg),
    }

    try {
      if (formData.id) {
        // Edit existing
        await api.patch(`/waste-categories/${formData.id}/`, payload)
        toastSuccess('Kategori berhasil diperbarui.')
      } else {
        // Create new
        await api.post('/waste-categories/', payload)
        toastSuccess('Kategori baru berhasil ditambahkan.')
      }
      setModalOpen(false)
      fetchMutate()
      globalMutate('/waste-categories/')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const apiErrs: FormErrors = {}
          for (const [field, messages] of Object.entries(err.errors)) {
            const msg = messages.join(', ')
            if (field === 'nama') apiErrs.nama = msg
            else if (field === 'harga_beli_per_kg') apiErrs.harga_beli_per_kg = msg
            else apiErrs._general = msg
          }
          setFormErrors(apiErrs)
        } else {
          setFormErrors({ _general: err.message })
        }
        toastError('Periksa kembali isian form.')
      } else {
        toastError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete ──
  async function handleDelete(categoryId: number) {
    setDeleteSubmitting(true)
    try {
      await api.delete(`/waste-categories/${categoryId}/`)
      toastSuccess('Kategori berhasil dihapus.')
      setDeleteConfirm(null)
      fetchMutate()
    } catch {
      toastError('Gagal menghapus kategori.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  // ── Loading ──
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Katalog & Harga Sampah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola kategori sampah dan harga beli per kilogram.
          </p>
        </div>
        <TableSkeleton rows={8} cols={4} />
      </div>
    )
  }

  // ── Error ──
  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Katalog & Harga Sampah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola kategori sampah dan harga beli per kilogram.
          </p>
        </div>
        <ErrorMessage
          title="Gagal memuat data"
          message="Tidak dapat memuat data kategori sampah. Periksa koneksi ke server."
          onRetry={() => fetchMutate()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Katalog & Harga Sampah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola kategori sampah dan harga beli per kilogram.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Button type="button" onClick={handleAdd}>
              <Plus className="size-4" aria-hidden />
              Tambah Kategori
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => fetchMutate()} disabled={fetchLoading}>
            <FileText className="size-4" aria-hidden />
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kategori</TableHead>
                <TableHead className="text-right">Harga Beli/kg</TableHead>
                <TableHead className="text-right">Stok Terkini</TableHead>
                <TableHead>Indikator Stok</TableHead>
                <TableHead className="text-right">Riwayat</TableHead>
                {canWrite && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryList.length === 0 ? (
                <TableEmpty
                  colSpan={canWrite ? 6 : 5}
                  message="Belum ada kategori sampah. Tambahkan kategori baru."
                />
              ) : (
                categoryList.map((cat) => {
                  const stokKg = parseFloat(cat.stok_terkini_kg)
                  return (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Package className="size-4 text-primary" aria-hidden />
                          </div>
                          <span className="font-medium text-foreground">{cat.nama}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="size-3.5 text-muted-foreground" aria-hidden />
                          {formatRupiah(cat.harga_beli_per_kg)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <Scale className="size-3.5 text-muted-foreground" aria-hidden />
                          {formatWeightKg(cat.stok_terkini_kg)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStockBadge(stokKg)}>
                          {stokKg < LOW_STOCK_THRESHOLD_KG && stokKg > 0 && (
                            <AlertTriangle className="mr-1 inline size-3" aria-hidden />
                          )}
                          {getStockLabel(stokKg)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPriceHistoryTarget({ id: cat.id, nama: cat.nama })}
                          >
                            <History className="size-4" aria-hidden />
                            Riwayat Harga
                          </Button>
                        </div>
                      </TableCell>
                      {canWrite && (
                        <TableCell>
                          <div className="flex justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(cat)}
                            >
                              <Edit className="size-4" aria-hidden />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(cat.id)}
                              className="text-danger hover:text-danger hover:bg-danger/10"
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

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={formData.id ? 'Edit Kategori' : 'Tambah Kategori'}
        description={
          formData.id
            ? 'Ubah nama dan harga kategori sampah.'
            : 'Tambahkan kategori sampah baru.'
        }
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="button" onClick={handleSubmit} loading={submitting} disabled={submitting}>
              {formData.id ? 'Simpan' : 'Tambah'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formErrors._general && (
            <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger" role="alert">
              {formErrors._general}
            </div>
          )}

          <Input
            label="Nama Kategori"
            placeholder="Contoh: Plastik PET"
            value={formData.nama}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, nama: e.target.value }))
              setFormErrors((prev) => {
                const next = { ...prev }; delete next.nama; return next
              })
            }}
            error={formErrors.nama}
          />

          <Input
            label="Harga Beli per Kg (Rp)"
            type="number"
            min="1"
            step="100"
            placeholder="Contoh: 3000"
            value={formData.harga_beli_per_kg}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, harga_beli_per_kg: e.target.value }))
              setFormErrors((prev) => {
                const next = { ...prev }; delete next.harga_beli_per_kg; return next
              })
            }}
            error={formErrors.harga_beli_per_kg}
          />

          <div className="rounded-lg border border-border bg-surface-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <AlertTriangle className="mr-1 inline size-3 text-warning" aria-hidden />
              Harga yang dimasukkan adalah harga beli dari nasabah per kilogram.
              Perubahan harga akan mempengaruhi perhitungan setoran selanjutnya.
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan."
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleteSubmitting}>
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              loading={deleteSubmitting}
              disabled={deleteSubmitting}
            >
              <Trash2 className="size-4" aria-hidden />
              Hapus
            </Button>
          </>
        }
      >
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertTriangle className="mr-1 inline size-4" aria-hidden />
          Kategori yang sudah memiliki riwayat transaksi mungkin tidak dapat dihapus.
        </div>
      </Modal>

      {/* Price History Modal */}
      {priceHistoryTarget && (
        <PriceHistoryModal
          categoryId={priceHistoryTarget.id}
          categoryName={priceHistoryTarget.nama}
          open={priceHistoryTarget !== null}
          onClose={() => setPriceHistoryTarget(null)}
        />
      )}
    </div>
  )
}
