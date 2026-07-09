'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { api, getAccessToken } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import { formatDateWIT, formatRupiah } from '@/lib/format'
import { canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ThumbsDown,
  User,
} from 'lucide-react'
import type { User as UserType, Withdrawal, WithdrawalStatus } from '@/types/models'
import type { PaginationMeta } from '@/types/api'

// ─── Constants ────────────────────────────────────────────────────

type TabKey = 'menunggu' | 'selesai'

interface TabDefinition {
  key: TabKey
  label: string
  statusFilter: string
}

const TABS: TabDefinition[] = [
  { key: 'menunggu', label: 'Menunggu', statusFilter: 'menunggu' },
  { key: 'selesai', label: 'Selesai', statusFilter: 'selesai,ditolak' },
]

// ─── Helpers ──────────────────────────────────────────────────────

function getStatusBadgeVariant(status: WithdrawalStatus) {
  switch (status) {
    case 'menunggu':
      return 'warning' as const
    case 'selesai':
      return 'success' as const
    case 'ditolak':
      return 'danger' as const
    default:
      return 'default' as const
  }
}

function getStatusLabel(status: WithdrawalStatus): string {
  const labels: Record<WithdrawalStatus, string> = {
    menunggu: 'Menunggu',
    selesai: 'Selesai',
    ditolak: 'Ditolak',
  }
  return labels[status] ?? status
}

// ─── Pagination ───────────────────────────────────────────────────

function PaginationControls({
  meta,
  page,
  onPageChange,
}: {
  meta: PaginationMeta | undefined
  page: number
  onPageChange: (p: number) => void
}) {
  if (!meta || meta.total_pages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Menampilkan halaman {meta.page} dari {meta.total_pages} ({meta.count} total)
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!meta.previous} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" aria-hidden />
          Sebelumnya
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!meta.next} onClick={() => onPageChange(page + 1)}>
          Selanjutnya
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}

// ─── Konfirmasi Setujui Modal ─────────────────────────────────────

function SetujuiModal({
  open,
  onClose,
  onConfirm,
  loading,
  nasabahId,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  nasabahId: number | null
}) {
  const { data: nasabahProfile } = useSWR(
    open && nasabahId ? `/users/${nasabahId}/` : null,
    (path) => api.get<UserType>(path),
    { revalidateOnFocus: false },
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Konfirmasi Pencairan Saldo"
      description="Setujui pencairan saldo nasabah."
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="button" onClick={onConfirm} loading={loading} disabled={loading}>
            <CheckCircle2 className="size-4" aria-hidden />
            Ya, Setujui
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Saldo saat ini */}
        {nasabahProfile && (
          <div className="rounded-lg bg-surface-muted p-3">
            <p className="text-xs text-muted-foreground">Saldo Nasabah Saat Ini</p>
            <p className="text-lg font-bold text-foreground">
              {nasabahProfile.saldo ? formatRupiah(nasabahProfile.saldo) : 'Rp0,00'}
            </p>
          </div>
        )}

        {/* Warning Manual Payment */}
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Pencairan Manual</p>
              <p className="text-sm text-muted-foreground">
                Pencairan dilakukan secara manual tunai atau transfer di luar sistem oleh admin.
                Pastikan Anda telah menyiapkan dana sebelum menyetujui.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Tolak Modal ──────────────────────────────────────────────────

function TolakSaldoModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (alasan: string) => void
  loading: boolean
}) {
  const [alasan, setAlasan] = useState('')

  function handleConfirm() {
    if (!alasan.trim()) return
    onConfirm(alasan.trim())
  }

  return (
    <Modal
      open={open}
      onClose={() => { setAlasan(''); onClose() }}
      title="Tolak Penarikan Saldo"
      description="Berikan alasan penolakan."
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => { setAlasan(''); onClose() }} disabled={loading}>
            Batal
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} loading={loading} disabled={!alasan.trim() || loading}>
            <ThumbsDown className="size-4" aria-hidden />
            Tolak
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="alasan-tolak-saldo" className="text-sm font-medium text-foreground">
          Alasan Penolakan <span className="text-danger">*</span>
        </label>
        <textarea
          id="alasan-tolak-saldo"
          rows={3}
          className="h-auto w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
          placeholder="Jelaskan alasan penolakan..."
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
        />
      </div>
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function WithdrawalManagement() {
  const { role: authRole } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()

  const [activeTab, setActiveTab] = useState<TabKey>('menunggu')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [showSetujuiModal, setShowSetujuiModal] = useState(false)
  const [showTolakModal, setShowTolakModal] = useState(false)

  const isReadOnly = !canMutate(authRole ?? 'admin')

  // ── Build query params ──
  const activeTabDef = TABS.find((t) => t.key === activeTab)!
  const params = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      page_size: '20',
      ordering: '-tanggal',
    }
    p.status__in = activeTabDef.statusFilter
    return p
  }, [page, activeTab])

  // ── Fetch withdrawals ──
  const {
    data: fetchResult,
    error: fetchError,
    isLoading: fetchLoading,
    mutate: fetchMutate,
  } = useSWR(
    ['/withdrawals', params],
    async ([path, queryParams]) => {
      const url = new URL(`${API_PREFIX}${path}/`)
      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.set(key, value)
      }
      const token = getAccessToken()
      const res = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Language': 'id',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const envelope = await res.json()
      return {
        withdrawals: (envelope.data ?? []) as Withdrawal[],
        pagination: envelope.meta?.pagination as PaginationMeta | undefined,
      }
    },
    { revalidateOnFocus: true },
  )

  const withdrawals = fetchResult?.withdrawals ?? []
  const paginationMeta = fetchResult?.pagination

  // ── Actions ──
  function handleSetujuiClick(withdrawal: Withdrawal) {
    setSelectedWithdrawal(withdrawal)
    setShowSetujuiModal(true)
  }

  function handleTolakClick(withdrawal: Withdrawal) {
    setSelectedWithdrawal(withdrawal)
    setShowTolakModal(true)
  }

  async function confirmSetujui() {
    if (!selectedWithdrawal) return
    setActionLoading(true)
    try {
      await api.patch(`/withdrawals/${selectedWithdrawal.id}/`, { status: 'selesai' })
      toastSuccess('Penarikan saldo berhasil disetujui.')
      setShowSetujuiModal(false)
      setSelectedWithdrawal(null)
      fetchMutate()
    } catch {
      toastError('Gagal menyetujui penarikan. Coba lagi.')
    } finally {
      setActionLoading(false)
    }
  }

  async function confirmTolak(alasan: string) {
    if (!selectedWithdrawal) return
    setActionLoading(true)
    try {
      await api.patch(`/withdrawals/${selectedWithdrawal.id}/`, {
        status: 'ditolak',
        catatan: alasan,
      })
      toastSuccess('Penarikan saldo ditolak.')
      setShowTolakModal(false)
      setSelectedWithdrawal(null)
      fetchMutate()
    } catch {
      toastError('Gagal menolak penarikan. Coba lagi.')
    } finally {
      setActionLoading(false)
    }
  }

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab)
    setPage(1)
  }

  // ── Loading ──
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Penarikan Saldo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar pengajuan penarikan saldo nasabah.</p>
        </div>
        <TableSkeleton rows={8} cols={5} />
      </div>
    )
  }

  // ── Error ──
  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Penarikan Saldo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar pengajuan penarikan saldo nasabah.</p>
        </div>
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat data penarikan saldo. Periksa koneksi ke server." onRetry={() => fetchMutate()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Penarikan Saldo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar pengajuan penarikan saldo nasabah.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => fetchMutate()} disabled={fetchLoading}>
          <FileText className="size-4" aria-hidden />
          Muat Ulang
        </Button>
      </div>

      {/* Tabs + Table */}
      <Card>
        <CardHeader className="border-b border-border pb-0">
          <div className="flex gap-1" role="tablist" aria-label="Filter status penarikan">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-background text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nasabah</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Status</TableHead>
                {!isReadOnly && activeTab === 'menunggu' && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.length === 0 ? (
                <TableEmpty colSpan={isReadOnly || activeTab !== 'menunggu' ? 5 : 6} message="Tidak ada pengajuan penarikan." />
              ) : (
                withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateWIT(w.tanggal, { dateStyle: 'medium' })}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground shrink-0" aria-hidden />
                        {w.nasabah_nama ?? `#${w.nasabah}`}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatRupiah(w.nominal)}</TableCell>
                    <TableCell className="text-muted-foreground">{w.metode}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(w.status)}>
                        {getStatusLabel(w.status)}
                      </Badge>
                    </TableCell>
                    {!isReadOnly && activeTab === 'menunggu' && (
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          <Button type="button" variant="primary" size="sm" onClick={() => handleSetujuiClick(w)} disabled={actionLoading}>
                            <CheckCircle2 className="size-3.5" aria-hidden />
                            Setujui
                          </Button>
                          <Button type="button" variant="danger" size="sm" onClick={() => handleTolakClick(w)} disabled={actionLoading}>
                            <ThumbsDown className="size-3.5" aria-hidden />
                            Tolak
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

        <PaginationControls meta={paginationMeta} page={page} onPageChange={setPage} />
      </Card>

      {/* Modals */}
      <SetujuiModal
        open={showSetujuiModal}
        onClose={() => { setShowSetujuiModal(false); setSelectedWithdrawal(null) }}
        onConfirm={confirmSetujui}
        loading={actionLoading}
        nasabahId={selectedWithdrawal?.nasabah ?? null}
      />

      <TolakSaldoModal
        open={showTolakModal}
        onClose={() => { setShowTolakModal(false); setSelectedWithdrawal(null) }}
        onConfirm={confirmTolak}
        loading={actionLoading}
      />
    </div>
  )
}
