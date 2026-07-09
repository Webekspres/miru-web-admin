'use client'

import { useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { api, getAccessToken, ApiError } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import { formatDateWIT } from '@/lib/format'
import { canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  CheckCircle2,
  Edit,
  FileText,
  Gift,
  Package,
  Plus,
  Star,
  Trash2,
  User,
} from 'lucide-react'
import type { Reward, RewardRedemption } from '@/types/models'
import type { PaginationMeta } from '@/types/api'

// ─── Constants ────────────────────────────────────────────────────

type TabKey = 'catalog' | 'redemptions'

interface TabDef {
  key: TabKey
  label: string
}

const TABS: TabDef[] = [
  { key: 'catalog', label: 'Katalog' },
  { key: 'redemptions', label: 'Penukaran' },
]

// ─── Reward Catalog Sub-component ─────────────────────────────────

function RewardCatalog({
  canWrite,
}: {
  canWrite: boolean
}) {
  const { success: toastSuccess, error: toastError } = useToast()
  const { mutate: globalMutate } = useSWRConfig()

  const { data: rewards, error, isLoading, mutate } = useSWR(
    '/rewards/',
    (path) => api.get<Reward[]>(path),
    { revalidateOnFocus: true },
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Reward | null>(null)
  const [formName, setFormName] = useState('')
  const [formPoin, setFormPoin] = useState('')
  const [formStok, setFormStok] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  function openAdd() {
    setEditItem(null)
    setFormName('')
    setFormPoin('')
    setFormStok('')
    setFormErrors({})
    setModalOpen(true)
  }

  function openEdit(r: Reward) {
    setEditItem(r)
    setFormName(r.nama)
    setFormPoin(String(r.poin_dibutuhkan))
    setFormStok(String(r.stok))
    setFormErrors({})
    setModalOpen(true)
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!formName.trim()) errs.nama = 'Nama reward wajib diisi.'
    const poin = parseInt(formPoin)
    if (!formPoin || isNaN(poin) || poin < 1) errs.poin_dibutuhkan = 'Poin harus minimal 1.'
    const stok = parseInt(formStok)
    if (!formStok || isNaN(stok) || stok < 0) errs.stok = 'Stok tidak valid.'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    const payload = { nama: formName.trim(), poin_dibutuhkan: parseInt(formPoin), stok: parseInt(formStok) }
    try {
      if (editItem) {
        await api.patch(`/rewards/${editItem.id}/`, payload)
        toastSuccess('Reward berhasil diperbarui.')
      } else {
        await api.post('/rewards/', payload)
        toastSuccess('Reward baru berhasil ditambahkan.')
      }
      setModalOpen(false)
      mutate()
      globalMutate('/rewards/')
    } catch (err) {
      if (err instanceof ApiError) {
        const errs: Record<string, string> = {}
        if (err.errors) {
          for (const [f, msgs] of Object.entries(err.errors)) {
            if (f === 'nama' || f === 'poin_dibutuhkan' || f === 'stok') errs[f] = msgs.join(', ')
            else errs._general = msgs.join(', ')
          }
        } else {
          errs._general = err.message
        }
        setFormErrors(errs)
        toastError('Periksa kembali isian form.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleteSubmitting(true)
    try {
      await api.delete(`/rewards/${id}/`)
      toastSuccess('Reward berhasil dihapus.')
      setDeleteConfirm(null)
      mutate()
    } catch {
      toastError('Gagal menghapus reward.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  if (isLoading) return <TableSkeleton rows={5} cols={4} />
  if (error) return <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat katalog reward." onRetry={() => mutate()} />

  const list = rewards ?? []

  return (
    <div className="space-y-4">
      {canWrite && (
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={openAdd}>
            <Plus className="size-4" aria-hidden />
            Tambah Reward
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Reward</TableHead>
              <TableHead className="text-right">Poin Dibutuhkan</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              {canWrite && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableEmpty colSpan={canWrite ? 4 : 3} message="Belum ada reward." />
            ) : (
              list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
                        <Gift className="size-4 text-warning" aria-hidden />
                      </div>
                      <span className="font-medium text-foreground">{r.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Star className="size-3.5 text-warning" aria-hidden />
                      {r.poin_dibutuhkan} poin
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={r.stok > 0 ? 'success' : 'danger'}>
                      <Package className="mr-1 inline size-3" aria-hidden />
                      {r.stok}
                    </Badge>
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(r)}>
                          <Edit className="size-4" aria-hidden />Edit
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/10" onClick={() => setDeleteConfirm(r.id)}>
                          <Trash2 className="size-4" aria-hidden />Hapus
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

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Reward' : 'Tambah Reward'}
        description={editItem ? 'Ubah nama, poin, dan stok reward.' : 'Tambahkan reward baru untuk penukaran poin.'}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Batal</Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>
              {editItem ? 'Simpan' : 'Tambah'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formErrors._general && (
            <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{formErrors._general}</div>
          )}
          <Input label="Nama Reward" placeholder="Contoh: Pulsa Rp10.000" value={formName}
            onChange={(e) => { setFormName(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.nama; return n }) }}
            error={formErrors.nama} />
          <Input label="Poin Dibutuhkan" type="number" min="1" placeholder="Contoh: 100" value={formPoin}
            onChange={(e) => { setFormPoin(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.poin_dibutuhkan; return n }) }}
            error={formErrors.poin_dibutuhkan} />
          <Input label="Stok" type="number" min="0" placeholder="Contoh: 50" value={formStok}
            onChange={(e) => { setFormStok(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.stok; return n }) }}
            error={formErrors.stok} />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Reward"
        description="Apakah Anda yakin ingin menghapus reward ini?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleteSubmitting}>Batal</Button>
            <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} loading={deleteSubmitting}>
              <Trash2 className="size-4" aria-hidden />Hapus
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Reward yang sudah memiliki riwayat penukaran mungkin tidak dapat dihapus.
        </p>
      </Modal>
    </div>
  )
}

// ─── Redemptions Sub-component ────────────────────────────────────

function RedemptionList({ canWrite }: { canWrite: boolean }) {
  const { success: toastSuccess, error: toastError } = useToast()
  const [page, setPage] = useState(1)
  const [loadingAction, setLoadingAction] = useState(false)

  const { data: fetchResult, error, isLoading, mutate } = useSWR(
    [`/reward-redemptions/`, { page: String(page), page_size: '20', ordering: '-tanggal' }],
    async ([path, params]: [string, Record<string, string>]) => {
      const url = new URL(`${API_PREFIX}${path}`)
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
      const token = getAccessToken()
      const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Language': 'id', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      const envelope = await res.json()
      return { items: (envelope.data ?? []) as RewardRedemption[], pagination: envelope.meta?.pagination as PaginationMeta | undefined }
    },
    { revalidateOnFocus: true },
  )

  const items = fetchResult?.items ?? []
  const pagination = fetchResult?.pagination

  async function handleApprove(redemption: RewardRedemption) {
    setLoadingAction(true)
    try {
      await api.patch(`/reward-redemptions/${redemption.id}/`, { status: 'selesai' })
      toastSuccess('Penukaran reward berhasil disetujui.')
      mutate()
    } catch {
      toastError('Gagal menyetujui penukaran.')
    } finally {
      setLoadingAction(false)
    }
  }

  if (isLoading) return <TableSkeleton rows={5} cols={5} />
  if (error) return <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat penukaran poin." onRetry={() => mutate()} />

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nasabah</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead className="text-right">Poin</TableHead>
            <TableHead>Status</TableHead>
            {canWrite && <TableHead className="text-right">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableEmpty colSpan={canWrite ? 6 : 5} message="Belum ada penukaran poin." />
          ) : (
            items.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">{formatDateWIT(r.tanggal, { dateStyle: 'medium' })}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground shrink-0" aria-hidden />
                    <span className="font-medium text-foreground">{r.nasabah_nama ?? `#${r.nasabah}`}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.reward_nama ?? `Reward #${r.reward}`}</TableCell>
                <TableCell className="text-right font-semibold">{r.poin_dibutuhkan ?? 0} poin</TableCell>
                <TableCell>
                  <Badge variant={r.status === 'selesai' ? 'success' : 'warning'}>
                    {r.status === 'selesai' ? 'Selesai' : 'Menunggu'}
                  </Badge>
                </TableCell>
                {canWrite && (
                  <TableCell>
                    <div className="flex justify-end">
                      {r.status === 'menunggu' && (
                        <Button type="button" variant="primary" size="sm" onClick={() => handleApprove(r)} disabled={loadingAction}>
                          <CheckCircle2 className="size-3.5" aria-hidden />
                          Setujui
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm text-muted-foreground">Halaman {pagination.page} dari {pagination.total_pages} ({pagination.count} total)</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.previous} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
            <Button variant="outline" size="sm" disabled={!pagination.next} onClick={() => setPage((p) => p + 1)}>Selanjutnya</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function RewardManagement() {
  const { role: authRole } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('catalog')
  const canWrite = authRole ? canMutate(authRole) : false

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reward & Poin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Katalog reward dan daftar penukaran poin nasabah.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-0">
          <div className="flex gap-1" role="tablist" aria-label="Reward management tabs">
            {TABS.map((tab) => (
              <button key={tab.key} type="button" role="tab" aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <div className="p-4">
          {activeTab === 'catalog' ? (
            <RewardCatalog canWrite={canWrite} />
          ) : (
            <RedemptionList canWrite={canWrite} />
          )}
        </div>
      </Card>
    </div>
  )
}
