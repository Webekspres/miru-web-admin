'use client'

import { useMemo, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { api, getAccessToken } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import { formatDateWIT, formatWeightKg } from '@/lib/format'
import { canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { Select } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  CheckCircle2,
  FileText,
  MapPin,
  ThumbsDown,
  ThumbsUp,
  Truck,
  UserPlus,
} from 'lucide-react'
import type { Pickup, PickupStatus, User as UserType } from '@/types/models'
import type { PaginationMeta } from '@/types/api'

// ─── Constants ────────────────────────────────────────────────────

type TabKey = 'menunggu' | 'aktif' | 'selesai' | 'ditolak'

interface TabDefinition {
  key: TabKey
  label: string
  statusFilter: string | string[]
}

const TABS: TabDefinition[] = [
  { key: 'menunggu', label: 'Menunggu', statusFilter: 'menunggu' },
  { key: 'aktif', label: 'Aktif', statusFilter: ['disetujui', 'dijadwalkan', 'dalam_perjalanan', 'dijemput'] },
  { key: 'selesai', label: 'Selesai', statusFilter: 'selesai' },
  { key: 'ditolak', label: 'Ditolak', statusFilter: 'ditolak' },
]

/** Petugas: hide menunggu/ditolak — only work queue + selesai */
const PETUGAS_TAB_KEYS: TabKey[] = ['aktif', 'selesai']

// ─── Helpers ──────────────────────────────────────────────────────

function getStatusBadgeVariant(status: PickupStatus) {
  switch (status) {
    case 'menunggu':
      return 'warning' as const
    case 'disetujui':
    case 'dijadwalkan':
      return 'primary' as const
    case 'dalam_perjalanan':
    case 'dijemput':
      return 'primary' as const
    case 'selesai':
      return 'success' as const
    case 'ditolak':
      return 'danger' as const
    default:
      return 'default' as const
  }
}

function getStatusLabel(status: PickupStatus): string {
  const labels: Record<PickupStatus, string> = {
    menunggu: 'Menunggu',
    disetujui: 'Disetujui',
    dijadwalkan: 'Dijadwalkan',
    dalam_perjalanan: 'Dalam Perjalanan',
    dijemput: 'Dijemput',
    selesai: 'Selesai',
    ditolak: 'Ditolak',
  }
  return labels[status] ?? status
}

/** Actions available per status — null means no action for that type */
interface PickupAction {
  label: string
  variant: 'primary' | 'danger' | 'outline'
  icon: typeof ThumbsUp
  nextStatus: PickupStatus
  requiresModal: 'approve_assign' | 'assign' | 'reject' | null
}

const ACTIONS_BY_STATUS: Partial<Record<PickupStatus, PickupAction[]>> = {
  menunggu: [
    {
      label: 'Setujui',
      variant: 'primary',
      icon: ThumbsUp,
      nextStatus: 'dijadwalkan',
      requiresModal: 'approve_assign',
    },
    { label: 'Tolak', variant: 'danger', icon: ThumbsDown, nextStatus: 'ditolak', requiresModal: 'reject' },
  ],
  disetujui: [
    {
      label: 'Tugaskan Petugas',
      variant: 'primary',
      icon: UserPlus,
      nextStatus: 'dijadwalkan',
      requiresModal: 'assign',
    },
  ],
  dijadwalkan: [
    { label: 'Mulai Penjemputan', variant: 'primary', icon: Truck, nextStatus: 'dalam_perjalanan', requiresModal: null },
  ],
  dalam_perjalanan: [
    { label: 'Sampai di Lokasi', variant: 'primary', icon: MapPin, nextStatus: 'dijemput', requiresModal: null },
  ],
  dijemput: [
    { label: 'Selesaikan', variant: 'primary', icon: CheckCircle2, nextStatus: 'selesai', requiresModal: null },
  ],
}

type AssignModalMode = 'approve_assign' | 'assign'

function formatPetugasOptionLabel(p: UserType): string {
  const name = p.nama_lengkap || p.username
  const roleLabel = p.role === 'petugas' ? 'Petugas' : p.role
  return `${name} · ${roleLabel}`
}

// ─── Assign Petugas Modal ─────────────────────────────────────────

function AssignPetugasModal({
  open,
  mode,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  mode: AssignModalMode
  onClose: () => void
  onConfirm: (petugasId: number) => void
  loading: boolean
}) {
  const [selectedId, setSelectedId] = useState('')

  const { data: petugasList, isLoading: petugasLoading } = useSWR(
    open ? '/users/?role=petugas&is_active=true' : null,
    (path) => api.get<UserType[]>(path),
    { revalidateOnFocus: false },
  )

  const options = (petugasList ?? []).map((p) => ({
    value: String(p.id),
    label: formatPetugasOptionLabel(p),
  }))

  const isApproveFlow = mode === 'approve_assign'
  const title = isApproveFlow ? 'Setujui & Pilih Petugas' : 'Tugaskan Petugas'
  const description = isApproveFlow
    ? 'Pilih petugas terlebih dahulu. Penjemputan baru disetujui setelah petugas dipilih.'
    : 'Pilih petugas yang akan menjemput sampah nasabah ini.'
  const confirmLabel = isApproveFlow ? 'Setujui & Tugaskan' : 'Tugaskan'
  const ConfirmIcon = isApproveFlow ? ThumbsUp : UserPlus

  function handleConfirm() {
    if (!selectedId) return
    onConfirm(Number(selectedId))
  }

  function handleClose() {
    setSelectedId('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            loading={loading}
            disabled={!selectedId || loading}
          >
            <ConfirmIcon className="size-4" aria-hidden />
            {confirmLabel}
          </Button>
        </>
      }
    >
      {petugasLoading ? (
        <p className="text-sm text-muted-foreground">Memuat daftar petugas...</p>
      ) : options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tidak ada petugas aktif. Tambahkan petugas terlebih dahulu.
        </p>
      ) : (
        <Select
          label="Pilih Petugas"
          placeholder="-- Pilih petugas --"
          options={options}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        />
      )}
    </Modal>
  )
}

// ─── Tolak Modal ──────────────────────────────────────────────────

function TolakModal({
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
      onClose={onClose}
      title="Tolak Penjemputan"
      description="Berikan alasan penolakan."
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            disabled={!alasan.trim() || loading}
          >
            <ThumbsDown className="size-4" aria-hidden />
            Tolak
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="alasan-tolak" className="text-sm font-medium text-foreground">
          Alasan Penolakan <span className="text-danger">*</span>
        </label>
        <textarea
          id="alasan-tolak"
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

// ─── Pagination ───────────────────────────────────────────────────



// ─── Main Component ───────────────────────────────────────────────

export function PickupManagement() {
  const { user } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const { mutate: globalMutate } = useSWRConfig()

  const role = user?.role ?? 'admin'
  const isReadOnly = role === 'nasabah' || !canMutate(role as 'admin' | 'petugas' | 'koordinator' | 'pemerintah')
  const isPetugas = user?.role === 'petugas'
  const visibleTabs = useMemo(
    () => (isPetugas ? TABS.filter((t) => PETUGAS_TAB_KEYS.includes(t.key)) : TABS),
    [isPetugas],
  )

  const [activeTab, setActiveTab] = useState<TabKey>(isPetugas ? 'aktif' : 'menunggu')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(false)

  // Modal state
  const [assignModal, setAssignModal] = useState<{
    open: boolean
    pickup: Pickup | null
    mode: AssignModalMode
  }>({
    open: false,
    pickup: null,
    mode: 'approve_assign',
  })
  const [tolakModal, setTolakModal] = useState<{ open: boolean; pickup: Pickup | null }>({
    open: false,
    pickup: null,
  })

  // ── Build query params ──
  const activeTabDef = visibleTabs.find((t) => t.key === activeTab) ?? visibleTabs[0]
  const params = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      page_size: '20',
      ordering: '-jadwal',
    }

    const statusFilter = activeTabDef.statusFilter
    if (Array.isArray(statusFilter)) {
      p.status__in = statusFilter.join(',')
    } else {
      p.status = statusFilter
    }

    // Petugas: only see assigned pickups (backend also filters; keep explicit)
    if (isPetugas && user?.id) {
      p.petugas = String(user.id)
    }

    return p
  }, [page, activeTabDef, isPetugas, user?.id])

  // ── Fetch data ──
  const {
    data: fetchResult,
    error: fetchError,
    isLoading: fetchLoading,
    mutate: fetchMutate,
  } = useSWR(
    ['/pickups', params],
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
        pickups: (envelope.data ?? []) as Pickup[],
        pagination: envelope.meta?.pagination as PaginationMeta | undefined,
      }
    },
    { revalidateOnFocus: true },
  )

  const pickups = fetchResult?.pickups ?? []
  const paginationMeta = fetchResult?.pagination

  async function refreshBadgesAndNotifs() {
    await Promise.all([
      globalMutate((key) => Array.isArray(key) && key[0] === 'sidebar-badges'),
      user?.id
        ? globalMutate((key) => Array.isArray(key) && key[0] === 'notifications' && key[1] === user.id)
        : Promise.resolve(),
    ])
  }

  // ── Actions ──
  async function handleAction(pickup: Pickup, action: PickupAction) {
    if (action.requiresModal === 'approve_assign') {
      setAssignModal({ open: true, pickup, mode: 'approve_assign' })
      return
    }
    if (action.requiresModal === 'assign') {
      setAssignModal({ open: true, pickup, mode: 'assign' })
      return
    }
    if (action.requiresModal === 'reject') {
      setTolakModal({ open: true, pickup })
      return
    }

    const ok = await executeStatusUpdate(pickup.id, action.nextStatus)
    if (ok) {
      await refreshBadgesAndNotifs()
    }
  }

  /**
   * Single submit: setujui + assign petugas.
   * Backend belum punya endpoint atomik (T3) — approve lalu assign berurutan.
   * API tidak dipanggil sebelum petugas dipilih di modal.
   */
  async function handleApproveAssign(petugasId: number) {
    if (!assignModal.pickup) return
    const pickupId = assignModal.pickup.id
    setActionLoading(true)
    try {
      await api.post(`/pickups/${pickupId}/approve/`, {})
      await api.post(`/pickups/${pickupId}/assign/`, { petugas_id: petugasId })
      toastSuccess('Penjemputan disetujui dan petugas ditugaskan.')
      setAssignModal({ open: false, pickup: null, mode: 'approve_assign' })
      setActiveTab('aktif')
      setPage(1)
      await fetchMutate()
      await refreshBadgesAndNotifs()
    } catch {
      toastError('Gagal menyetujui penjemputan. Pastikan petugas dipilih dan coba lagi.')
      await fetchMutate()
      await refreshBadgesAndNotifs()
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAssignOnly(petugasId: number) {
    if (!assignModal.pickup) return
    setActionLoading(true)
    try {
      await api.post(`/pickups/${assignModal.pickup.id}/assign/`, { petugas_id: petugasId })
      toastSuccess('Petugas berhasil ditugaskan.')
      setAssignModal({ open: false, pickup: null, mode: 'assign' })
      await fetchMutate()
      await refreshBadgesAndNotifs()
    } catch {
      toastError('Gagal menugaskan petugas. Coba lagi.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleTolak(_alasan: string) {
    if (!tolakModal.pickup) return
    setActionLoading(true)
    try {
      // Backend reject action belum menerima alasan; modal tetap minta alasan untuk UX.
      await api.post(`/pickups/${tolakModal.pickup.id}/reject/`, {})
      toastSuccess('Penjemputan berhasil ditolak.')
      setTolakModal({ open: false, pickup: null })
      await fetchMutate()
      await refreshBadgesAndNotifs()
    } catch {
      toastError('Gagal menolak penjemputan. Coba lagi.')
    } finally {
      setActionLoading(false)
    }
  }

  async function executeStatusUpdate(pickupId: number, nextStatus: PickupStatus): Promise<boolean> {
    setActionLoading(true)
    try {
      await api.post(`/pickups/${pickupId}/update-status/`, { status: nextStatus })
      toastSuccess('Status penjemputan berhasil diperbarui.')
      await fetchMutate()
      return true
    } catch {
      // Fallback ke PATCH untuk kompatibilitas
      try {
        await api.patch(`/pickups/${pickupId}/`, { status: nextStatus })
        toastSuccess('Status penjemputan berhasil diperbarui.')
        await fetchMutate()
        return true
      } catch {
        toastError('Gagal memperbarui status. Coba lagi.')
        return false
      }
    } finally {
      setActionLoading(false)
    }
  }

  // ── Tab change ──
  function handleTabChange(tab: TabKey) {
    setActiveTab(tab)
    setPage(1)
  }

  // ── Loading ──
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Penjemputan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar permintaan penjemputan sampah.</p>
        </div>
        <TableSkeleton rows={8} cols={6} />
      </div>
    )
  }

  // ── Error ──
  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Penjemputan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar permintaan penjemputan sampah.</p>
        </div>
        <ErrorMessage
          title="Gagal memuat data"
          message="Tidak dapat memuat data penjemputan. Periksa koneksi ke server."
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
          <h1 className="text-2xl font-semibold text-foreground">Penjemputan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar permintaan penjemputan sampah.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => fetchMutate()} disabled={fetchLoading}>
          <FileText className="size-4" aria-hidden />
          Muat Ulang
        </Button>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader className="border-b border-border pb-0">
          <div className="flex gap-1" role="tablist" aria-label="Filter status penjemputan">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
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

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nasabah</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Estimasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Petugas</TableHead>
                {!isReadOnly && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickups.length === 0 ? (
                <TableEmpty colSpan={isReadOnly ? 6 : 7} message="Tidak ada penjemputan." />
              ) : (
                pickups.map((pickup) => {
                  const actions = ACTIONS_BY_STATUS[pickup.status] ?? []

                  return (
                    <TableRow key={pickup.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateWIT(pickup.tanggal_pengajuan ?? pickup.jadwal, {
                          dateStyle: 'medium',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {pickup.nasabah_nama ?? `#${pickup.nasabah}`}
                      </TableCell>
                      <TableCell className="max-w-50 truncate text-muted-foreground" title={pickup.alamat_jemput}>
                        {pickup.alamat_jemput}
                      </TableCell>
                      <TableCell>
                        <span className="whitespace-nowrap text-muted-foreground">
                          {formatWeightKg(pickup.estimasi_berat)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(pickup.status)}>
                          {getStatusLabel(pickup.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pickup.petugas_nama ?? 'Belum ditugaskan'}
                      </TableCell>
                      {!isReadOnly && (
                        <TableCell>
                          <div className="flex justify-end gap-1.5">
                            {actions.map((action) => (
                              <Button
                                key={action.label}
                                type="button"
                                variant={action.variant}
                                size="sm"
                                onClick={() => handleAction(pickup, action)}
                                disabled={actionLoading}
                              >
                                <action.icon className="size-3.5" aria-hidden />
                                {action.label}
                              </Button>
                            ))}
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

        {/* Pagination */}
        <PaginationControls meta={paginationMeta} page={page} onPageChange={setPage} />
      </Card>

      {/* Assign Petugas Modal */}
      <AssignPetugasModal
        key={assignModal.pickup ? `${assignModal.mode}-${assignModal.pickup.id}` : assignModal.mode}
        open={assignModal.open}
        mode={assignModal.mode}
        onClose={() => setAssignModal({ open: false, pickup: null, mode: assignModal.mode })}
        onConfirm={assignModal.mode === 'approve_assign' ? handleApproveAssign : handleAssignOnly}
        loading={actionLoading}
      />

      {/* Tolak Modal */}
      <TolakModal
        open={tolakModal.open}
        onClose={() => setTolakModal({ open: false, pickup: null })}
        onConfirm={handleTolak}
        loading={actionLoading}
      />
    </div>
  )
}
