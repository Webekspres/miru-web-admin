'use client'

import { useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { api, ApiError } from '@/lib/api'
import { formatDateWIT } from '@/lib/format'
import { canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  BookOpen,
  Edit,
  Eye,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react'
import type { KontenEdukasi, WasteCategory } from '@/types/models'

// ─── Types ────────────────────────────────────────────────────────

interface FormState {
  id: number | null
  judul: string
  isi: string
  kategori_terkait: string
  aktif: boolean
  urutan: string
}

interface FormErrors {
  judul?: string
  isi?: string
  kategori_terkait?: string
  urutan?: string
  _general?: string
}

const EMPTY_FORM: FormState = {
  id: null,
  judul: '',
  isi: '',
  kategori_terkait: '',
  aktif: true,
  urutan: '0',
}

// ─── Komponen: preview Markdown ───────────────────────────────────

function MarkdownPreview({ source }: { source: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Eye className="size-3.5" aria-hidden />
        Preview
      </p>
      {source.trim() ? (
        <MarkdownContent source={source} />
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada isi untuk di-preview.</p>
      )}
    </div>
  )
}

// ─── Komponen utama ───────────────────────────────────────────────

export function EducationManagement() {
  const { role: authRole } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const { mutate: globalMutate } = useSWRConfig()
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

  const { data: categories } = useSWR('/waste-categories/', (path) => api.get<WasteCategory[]>(path), {
    revalidateOnFocus: false,
  })
  const categoryOptions = (categories ?? []).map((c) => ({
    value: String(c.id),
    label: c.nama,
  }))

  const list = items ?? []

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<KontenEdukasi | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // ── Open add / edit ──
  function openAdd() {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowPreview(false)
    setModalOpen(true)
  }

  function openEdit(item: KontenEdukasi) {
    setForm({
      id: item.id,
      judul: item.judul,
      isi: item.isi,
      kategori_terkait: item.kategori_terkait ? String(item.kategori_terkait) : '',
      aktif: item.aktif,
      urutan: String(item.urutan),
    })
    setFormErrors({})
    setShowPreview(false)
    setModalOpen(true)
  }

  // ── Validasi ──
  function validate(): boolean {
    const errs: FormErrors = {}
    let valid = true

    if (!form.judul.trim()) {
      errs.judul = 'Judul wajib diisi.'
      valid = false
    }
    if (!form.isi.trim()) {
      errs.isi = 'Isi konten wajib diisi.'
      valid = false
    }
    const urutan = parseInt(form.urutan)
    if (form.urutan === '' || isNaN(urutan) || urutan < 0) {
      errs.urutan = 'Urutan harus angka ≥ 0.'
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
      judul: form.judul.trim(),
      isi: form.isi,
      kategori_terkait: form.kategori_terkait ? Number(form.kategori_terkait) : null,
      aktif: form.aktif,
      urutan: parseInt(form.urutan),
    }

    try {
      if (form.id) {
        await api.patch(`/edukasi/${form.id}/`, payload)
        toastSuccess('Artikel edukasi berhasil diperbarui.')
      } else {
        await api.post('/edukasi/', payload)
        toastSuccess('Artikel edukasi baru berhasil ditambahkan.')
      }
      setModalOpen(false)
      fetchMutate()
      globalMutate('/edukasi/')
    } catch (err) {
      if (err instanceof ApiError) {
        const apiErrs: FormErrors = {}
        if (err.errors) {
          for (const [field, messages] of Object.entries(err.errors)) {
            const msg = messages.join(', ')
            if (field === 'judul') apiErrs.judul = msg
            else if (field === 'isi') apiErrs.isi = msg
            else if (field === 'kategori_terkait') apiErrs.kategori_terkait = msg
            else if (field === 'urutan') apiErrs.urutan = msg
            else apiErrs._general = msg
          }
        } else {
          apiErrs._general = err.message
        }
        setFormErrors(apiErrs)
        toastError('Periksa kembali isian form.')
      } else {
        toastError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

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
          <h1 className="text-2xl font-semibold text-foreground">Edukasi Sampah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola artikel dan panduan pemilahan sampah untuk nasabah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Button type="button" onClick={openAdd}>
              <Plus className="size-4" aria-hidden />
              Tambah Artikel
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => fetchMutate()} disabled={fetchLoading}>
            <FileText className="size-4" aria-hidden />
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Tabel */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori Terkait</TableHead>
                <TableHead className="text-right">Urutan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diperbarui</TableHead>
                {canWrite && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableEmpty
                  colSpan={canWrite ? 6 : 5}
                  message="Belum ada artikel edukasi. Tambahkan artikel baru."
                />
              ) : (
                list.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <BookOpen className="size-4 text-primary" aria-hidden />
                        </div>
                        <span className="font-medium text-foreground">{item.judul}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.kategori_terkait_nama ?? '—'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.urutan}</TableCell>
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
                          <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(item)}>
                            <Edit className="size-4" aria-hidden />
                            Edit
                          </Button>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal Tambah/Edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit Artikel Edukasi' : 'Tambah Artikel Edukasi'}
        description="Judul, isi Markdown, kategori terkait opsional, dan urutan tampil."
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowPreview((v) => !v)} disabled={submitting}>
              <Eye className="size-4" aria-hidden />
              {showPreview ? 'Sembunyikan Preview' : 'Preview'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="button" onClick={handleSubmit} loading={submitting} disabled={submitting}>
              {form.id ? 'Simpan' : 'Tambah'}
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
            label="Judul"
            placeholder="Contoh: Cara Memilah Sampah Plastik"
            value={form.judul}
            onChange={(e) => {
              setForm((p) => ({ ...p, judul: e.target.value }))
              setFormErrors((p) => { const n = { ...p }; delete n.judul; return n })
            }}
            error={formErrors.judul}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Kategori Terkait (opsional)"
              placeholder="Tidak ada"
              options={categoryOptions}
              value={form.kategori_terkait}
              onChange={(e) => {
                setForm((p) => ({ ...p, kategori_terkait: e.target.value }))
                setFormErrors((p) => { const n = { ...p }; delete n.kategori_terkait; return n })
              }}
              error={formErrors.kategori_terkait}
            />
            <Input
              label="Urutan"
              type="number"
              min="0"
              placeholder="Contoh: 1"
              value={form.urutan}
              onChange={(e) => {
                setForm((p) => ({ ...p, urutan: e.target.value }))
                setFormErrors((p) => { const n = { ...p }; delete n.urutan; return n })
              }}
              error={formErrors.urutan}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="edukasi-isi">
              Isi Konten (Markdown)
            </label>
            <textarea
              id="edukasi-isi"
              rows={8}
              className={`w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary ${
                formErrors.isi ? 'border-danger' : 'border-border'
              }`}
              placeholder={'# Judul bagian\n\nTulis panduan dengan Markdown. Mendukung **tebal**, *miring*, daftar, dan `kode`.'}
              value={form.isi}
              onChange={(e) => {
                setForm((p) => ({ ...p, isi: e.target.value }))
                setFormErrors((p) => { const n = { ...p }; delete n.isi; return n })
              }}
            />
            {formErrors.isi && (
              <p className="mt-1 text-xs text-danger" role="alert">{formErrors.isi}</p>
            )}
          </div>

          {showPreview && <MarkdownPreview source={form.isi} />}

          {/* Status aktif */}
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <label className="text-sm font-medium text-foreground" htmlFor="edukasi-aktif">
              Status Artikel
            </label>
            <button
              id="edukasi-aktif"
              type="button"
              role="switch"
              aria-checked={form.aktif}
              onClick={() => setForm((p) => ({ ...p, aktif: !p.aktif }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                form.aktif ? 'bg-success' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                  form.aktif ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
            <span className="text-sm text-muted-foreground">
              {form.aktif ? 'Tampil di aplikasi nasabah' : 'Disembunyikan dari nasabah'}
            </span>
          </div>
        </div>
      </Modal>

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
              Hapus
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
