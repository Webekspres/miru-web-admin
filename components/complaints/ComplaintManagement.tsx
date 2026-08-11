'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { api, getAccessToken } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import { formatDateWIT } from '@/lib/format'
import { canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  AlertCircle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  MessageSquareText,
  User,
} from 'lucide-react'
import type { Complaint, ComplaintType as ComplaintTypeEnum } from '@/types/models'
import type { PaginationMeta } from '@/types/api'

// ─── Constants ────────────────────────────────────────────────────

type TabKey = 'terbuka' | 'ditutup'

interface TabDefinition {
  key: TabKey
  label: string
  statusFilter: string
}

const TABS: TabDefinition[] = [
  { key: 'terbuka', label: 'Terbuka', statusFilter: 'terbuka' },
  { key: 'ditutup', label: 'Ditutup', statusFilter: 'ditutup' },
]

const COMPLAINT_TYPE_LABELS: Record<ComplaintTypeEnum, string> = {
  saldo_belum_masuk: 'Saldo Belum Masuk',
  penjemputan_terlambat: 'Penjemputan Terlambat',
  berat_tidak_sesuai: 'Berat Tidak Sesuai',
  harga_tidak_sesuai: 'Harga Tidak Sesuai',
  petugas_tidak_datang: 'Petugas Tidak Datang',
  kesalahan_data: 'Kesalahan Data Nasabah',
  bukti_tidak_muncul: 'Bukti Transaksi Tidak Muncul',
  lainnya: 'Lainnya',
}

/** Target SLA dalam hari kerja */
const SLA_TARGET_DAYS = 2

// ─── Helpers ──────────────────────────────────────────────────────

function getStatusBadgeVariant(status: string) {
  return status === 'terbuka' ? 'warning' as const : 'default' as const
}

function getStatusLabel(status: string): string {
  return status === 'terbuka' ? 'Terbuka' : 'Ditutup'
}

function getComplaintTypeLabel(jenis: ComplaintTypeEnum): string {
  return COMPLAINT_TYPE_LABELS[jenis] ?? jenis
}

/**
 * Hitung selisih hari kerja (Senin–Sabtu) antara tanggal pengaduan dan sekarang.
 * Jam layanan: 08.00–17.00 WIT, Minggu & hari libur libur.
 */
function calculateSLADays(tanggal: string): number {
  const start = new Date(tanggal)
  const now = new Date()
  let count = 0
  const current = new Date(start)

  while (current <= now) {
    const day = current.getDay()
    // 0 = Minggu (libur), skip
    if (day !== 0) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

function getSLAStatus(tanggal: string): { label: string; variant: 'success' | 'warning' | 'danger' } {
  const days = calculateSLADays(tanggal)
  if (days <= SLA_TARGET_DAYS) {
    return { label: `${days} hr (on track)`, variant: 'success' }
  }
  return { label: `${days} hr (${days - SLA_TARGET_DAYS} hr lewat)`, variant: 'danger' }
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

// ─── Detail Modal ─────────────────────────────────────────────────

function DetailPengaduanModal({
  complaint,
  open,
  onClose,
  onTutup,
  tindakLanjutValue,
  onTindakLanjutChange,
  isReadOnly,
  tindakLanjutInvalid,
}: {
  complaint: Complaint | null
  open: boolean
  onClose: () => void
  onTutup: () => void
  tindakLanjutValue: string
  onTindakLanjutChange: (value: string) => void
  isReadOnly: boolean
  tindakLanjutInvalid: boolean
}) {
  const sla = complaint ? getSLAStatus(complaint.tanggal) : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Pengaduan"
      description={complaint ? `#${complaint.id} — ${getComplaintTypeLabel(complaint.jenis_pengaduan)}` : ''}
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
          {open && complaint?.status === 'terbuka' && !isReadOnly && (
            <Button type="button" variant="primary" onClick={onTutup}>
              <MessageSquareText className="size-4" aria-hidden />
              Tutup Pengaduan
            </Button>
          )}
        </>
      }
    >
      {complaint && (
        <div className="space-y-5">
          {/* Info Header */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-muted p-4">
            <div>
              <p className="text-xs text-muted-foreground">Nasabah</p>
              <p className="font-medium text-foreground">{complaint.nasabah_nama ?? `#${complaint.nasabah}`}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tanggal</p>
              <p className="font-medium text-foreground">{formatDateWIT(complaint.tanggal, { dateStyle: 'medium' })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Jenis Pengaduan</p>
              <p className="font-medium text-foreground">{getComplaintTypeLabel(complaint.jenis_pengaduan)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={getStatusBadgeVariant(complaint.status)}>
                {getStatusLabel(complaint.status)}
              </Badge>
            </div>
          </div>

          {/* SLA */}
          {sla && (
            <div className="flex items-center gap-2 rounded-lg border border-border p-3">
              <CalendarClock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <p className="text-xs text-muted-foreground">
                Target penyelesaian:{' '}
                <span className="font-medium text-foreground">{SLA_TARGET_DAYS} hari kerja</span>
              </p>
              <Badge variant={sla.variant}>{sla.label}</Badge>
            </div>
          )}

          {/* Keluhan */}
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <MessageSquare className="size-4 text-muted-foreground" aria-hidden />
              Keluhan Nasabah
            </h4>
            <div className="rounded-lg border border-border bg-background p-3 text-sm text-foreground">
              {complaint.keluhan}
            </div>
          </div>

          {/* Tindak Lanjut */}
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <MessageSquareText className="size-4 text-muted-foreground" aria-hidden />
              Tindak Lanjut
            </h4>
            {complaint.tindak_lanjut ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
                {complaint.tindak_lanjut}
              </div>
            ) : complaint.status === 'terbuka' ? (
              <div className="space-y-1.5">
                <textarea
                  id="tindak-lanjut-input"
                  rows={3}
                  aria-invalid={tindakLanjutInvalid}
                  aria-describedby={tindakLanjutInvalid ? 'tindak-lanjut-error' : undefined}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary ${
                    tindakLanjutInvalid ? 'border-danger' : 'border-border'
                  }`}
                  placeholder={isReadOnly ? 'Belum ada tindak lanjut.' : 'Isi tindak lanjut untuk pengaduan ini...'}
                  value={tindakLanjutValue}
                  onChange={(e) => onTindakLanjutChange(e.target.value)}
                  readOnly={isReadOnly}
                />
                {tindakLanjutInvalid && (
                  <p id="tindak-lanjut-error" className="text-xs text-danger">
                    Isi tindak lanjut dulu
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function ComplaintManagement() {
  const { role: authRole } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()

  const [activeTab, setActiveTab] = useState<TabKey>('terbuka')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [tindakLanjutValue, setTindakLanjutValue] = useState('')
  const [tindakLanjutInvalid, setTindakLanjutInvalid] = useState(false)
  const [showTindakLanjutAlert, setShowTindakLanjutAlert] = useState(false)

  const isReadOnly = !canMutate(authRole ?? 'admin')

  // ── Build query params ──
  const activeTabDef = TABS.find((t) => t.key === activeTab)!
  const params = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      page_size: '20',
      ordering: '-tanggal',
    }
    p.status = activeTabDef.statusFilter
    return p
  }, [page, activeTab])

  // ── Fetch complaints ──
  const {
    data: fetchResult,
    error: fetchError,
    isLoading: fetchLoading,
    mutate: fetchMutate,
  } = useSWR(
    ['/complaints', params],
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
        complaints: (envelope.data ?? []) as Complaint[],
        pagination: envelope.meta?.pagination as PaginationMeta | undefined,
      }
    },
    { revalidateOnFocus: true },
  )

  const complaints = fetchResult?.complaints ?? []
  const paginationMeta = fetchResult?.pagination

  // ── Actions ──
  function handleRowClick(complaint: Complaint) {
    setSelectedComplaint(complaint)
    setTindakLanjutValue(complaint.tindak_lanjut ?? '')
    setTindakLanjutInvalid(false)
    setShowDetail(true)
  }

  function handleCloseDetail() {
    setShowDetail(false)
    setSelectedComplaint(null)
    setTindakLanjutValue('')
    setTindakLanjutInvalid(false)
  }

  async function handleTutupPengaduan() {
    if (!selectedComplaint) return
    if (!tindakLanjutValue.trim()) {
      setTindakLanjutInvalid(true)
      setShowTindakLanjutAlert(true)
      return
    }
    setActionLoading(true)
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/`, {
        status: 'ditutup',
        tindak_lanjut: tindakLanjutValue.trim(),
      })
      toastSuccess('Pengaduan berhasil ditutup.')
      setShowDetail(false)
      setSelectedComplaint(null)
      setTindakLanjutValue('')
      setTindakLanjutInvalid(false)
      fetchMutate()
    } catch {
      toastError('Gagal menutup pengaduan. Coba lagi.')
    } finally {
      setActionLoading(false)
    }
  }

  function handleTindakLanjutChange(value: string) {
    setTindakLanjutValue(value)
    if (tindakLanjutInvalid && value.trim()) {
      setTindakLanjutInvalid(false)
    }
  }

  function handleDismissTindakLanjutAlert() {
    setShowTindakLanjutAlert(false)
    // Fokus kembali ke textarea setelah dialog ditutup
    window.setTimeout(() => {
      document.getElementById('tindak-lanjut-input')?.focus()
    }, 0)
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
          <h1 className="text-2xl font-semibold text-foreground">Pengaduan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar pengaduan nasabah.</p>
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
          <h1 className="text-2xl font-semibold text-foreground">Pengaduan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar pengaduan nasabah.</p>
        </div>
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat data pengaduan. Periksa koneksi ke server." onRetry={() => fetchMutate()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pengaduan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar pengaduan nasabah.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => fetchMutate()} disabled={fetchLoading}>
          <FileText className="size-4" aria-hidden />
          Muat Ulang
        </Button>
      </div>

      {/* Tabs + Table */}
      <Card>
        <CardHeader className="border-b border-border pb-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-1" role="tablist" aria-label="Filter status pengaduan">
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
            {/* SLA Info */}
            <p className="hidden text-xs text-muted-foreground sm:block">
              <CalendarClock className="mr-1 inline size-3" aria-hidden />
              Target penyelesaian: <span className="font-medium">{SLA_TARGET_DAYS} hari kerja</span>
            </p>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nasabah</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.length === 0 ? (
                <TableEmpty colSpan={5} message="Tidak ada pengaduan." />
              ) : (
                complaints.map((c) => {
                  const sla = getSLAStatus(c.tanggal)
                  return (
                    <TableRow key={c.id} className="cursor-pointer" onClick={() => handleRowClick(c)}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateWIT(c.tanggal, { dateStyle: 'medium' })}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          {c.nasabah_nama ?? `#${c.nasabah}`}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground" title={getComplaintTypeLabel(c.jenis_pengaduan)}>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                          {getComplaintTypeLabel(c.jenis_pengaduan)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(c.status)}>
                          {getStatusLabel(c.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sla.variant}>{sla.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationControls meta={paginationMeta} page={page} onPageChange={setPage} />
      </Card>

      {/* Detail Modal */}
      <DetailPengaduanModal
        complaint={selectedComplaint}
        open={showDetail}
        onClose={handleCloseDetail}
        onTutup={handleTutupPengaduan}
        tindakLanjutValue={tindakLanjutValue}
        onTindakLanjutChange={handleTindakLanjutChange}
        isReadOnly={isReadOnly}
        tindakLanjutInvalid={tindakLanjutInvalid}
      />

      {/* Alert: tindak lanjut wajib sebelum tutup */}
      <Modal
        open={showTindakLanjutAlert}
        onClose={handleDismissTindakLanjutAlert}
        title="Tindak lanjut wajib"
        description="Isi tindak lanjut dulu sebelum menutup pengaduan."
        size="sm"
        footer={
          <Button type="button" variant="primary" onClick={handleDismissTindakLanjutAlert}>
            Mengerti
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Pengaduan tidak dapat ditutup tanpa catatan tindak lanjut.
        </p>
      </Modal>
    </div>
  )
}
