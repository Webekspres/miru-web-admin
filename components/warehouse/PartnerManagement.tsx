'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api, ApiError } from '@/lib/api'
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
  Building2,
  Edit,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react'
import type { Partner } from '@/types/models'

export function PartnerManagement() {
  const { success: toastSuccess, error: toastError } = useToast()

  const { data: partners, error, isLoading, mutate } = useSWR(
    '/partners/',
    (path) => api.get<Partner[]>(path),
    { revalidateOnFocus: true },
  )

  const list = partners ?? []

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Partner | null>(null)
  const [formName, setFormName] = useState('')
  const [formKontak, setFormKontak] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  function openAdd() {
    setEditItem(null); setFormName(''); setFormKontak(''); setFormErrors({}); setModalOpen(true)
  }

  function openEdit(p: Partner) {
    setEditItem(p); setFormName(p.nama); setFormKontak(p.kontak); setFormErrors({}); setModalOpen(true)
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!formName.trim()) errs.nama = 'Nama mitra wajib diisi.'
    if (!formKontak.trim()) errs.kontak = 'Kontak mitra wajib diisi.'
    setFormErrors(errs); return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    const payload = { nama: formName.trim(), kontak: formKontak.trim() }
    try {
      if (editItem) {
        await api.patch(`/partners/${editItem.id}/`, payload)
        toastSuccess('Data mitra berhasil diperbarui.')
      } else {
        await api.post('/partners/', payload)
        toastSuccess('Mitra baru berhasil ditambahkan.')
      }
      setModalOpen(false); mutate()
    } catch (err) {
      if (err instanceof ApiError) {
        const errs: Record<string, string> = {}
        if (err.errors) for (const [f, msgs] of Object.entries(err.errors)) errs[f] = msgs.join(', ')
        else errs._general = err.message
        setFormErrors(errs)
        toastError('Periksa kembali isian form.')
      }
    } finally { setSubmitting(false) }
  }

  async function handleDelete(id: number) {
    setDeleteSubmitting(true)
    try { await api.delete(`/partners/${id}/`); toastSuccess('Mitra berhasil dihapus.'); setDeleteConfirm(null); mutate() }
    catch { toastError('Gagal menghapus mitra.') }
    finally { setDeleteSubmitting(false) }
  }

  if (isLoading) return <div className="space-y-6"><h1 className="text-2xl font-semibold text-foreground">Mitra Pengepul</h1><TableSkeleton rows={5} cols={3} /></div>
  if (error) return <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat data mitra." onRetry={() => mutate()} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mitra Pengepul</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola data mitra/pengepul bank sampah.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={openAdd}><Plus className="size-4" aria-hidden />Tambah Mitra</Button>
          <Button type="button" variant="ghost" onClick={() => mutate()}><FileText className="size-4" aria-hidden />Muat Ulang</Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Mitra</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableEmpty colSpan={3} message="Belum ada mitra terdaftar." />
              ) : (
                list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Building2 className="size-4 text-primary" aria-hidden />
                        </div>
                        <span className="font-medium text-foreground">{p.nama}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.kontak}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Edit className="size-4" aria-hidden />Edit</Button>
                        <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/10" onClick={() => setDeleteConfirm(p.id)}><Trash2 className="size-4" aria-hidden />Hapus</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Mitra' : 'Tambah Mitra'}
        description="Data mitra/pengepul yang membeli sampah dari bank sampah."
        size="sm"
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Batal</Button><Button onClick={handleSubmit} loading={submitting} disabled={submitting}>{editItem ? 'Simpan' : 'Tambah'}</Button></>}
      >
        <div className="space-y-4">
          {formErrors._general && <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{formErrors._general}</div>}
          <Input label="Nama Mitra" placeholder="Contoh: Pengepul Maju Jaya" value={formName}
            onChange={(e) => { setFormName(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.nama; return n }) }} error={formErrors.nama} />
          <Input label="Kontak" placeholder="Contoh: 081234567890 / alamat" value={formKontak}
            onChange={(e) => { setFormKontak(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.kontak; return n }) }} error={formErrors.kontak} />
        </div>
      </Modal>

      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}
        title="Hapus Mitra" description="Apakah Anda yakin ingin menghapus mitra ini?"
        size="sm"
        footer={<><Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleteSubmitting}>Batal</Button><Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} loading={deleteSubmitting}><Trash2 className="size-4" aria-hidden />Hapus</Button></>}
      >
        <p className="text-sm text-muted-foreground">Mitra yang sudah memiliki riwayat penjualan mungkin tidak dapat dihapus.</p>
      </Modal>
    </div>
  )
}
