'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, getAccessToken } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import { formatDateWIT, formatRupiah, formatWeightKg } from '@/lib/format'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Calendar, FileText, User } from 'lucide-react'
import type { Deposit } from '@/types/models'
import type { PaginationMeta } from '@/types/api'
// ─── Helpers ──────────────────────────────────────────────────────

function getTodayWIT(): string {
  const now = new Date()
  const wit = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jayapura' }))
  return wit.toISOString().split('T')[0] // YYYY-MM-DD
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'selesai':
      return 'success' as const
    case 'dibatalkan':
      return 'danger' as const
    case 'diproses':
      return 'warning' as const
    default:
      return 'default' as const
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
    diproses: 'Diproses',
  }
  return labels[status] ?? status
}

// ─── Detail Modal ─────────────────────────────────────────────────

function DetailDepositModal({
  depositId,
  open,
  onClose,
}: {
  depositId: number | null
  open: boolean
  onClose: () => void
}) {
  const {
    data: deposit,
    error,
    isLoading,
  } = useSWR(
    open && depositId ? `/deposits/${depositId}/` : null,
    (path) => api.get<Deposit>(path),
    { revalidateOnFocus: false },
  )

  const details = deposit?.details ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Setoran"
      description={deposit ? `Transaksi #${deposit.id}` : 'Memuat detail...'}
      size="lg"
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      {isLoading && (
        <div className="space-y-4">
          <TableSkeleton rows={3} cols={3} />
        </div>
      )}

      {error && (
        <ErrorMessage
          title="Gagal memuat detail"
          message="Tidak dapat memuat detail setoran. Coba lagi."
          retryLabel="Coba lagi"
        />
      )}

      {!isLoading && !error && deposit && (
        <div className="space-y-5">
          {/* Info Header */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-muted p-4">
            <div>
              <p className="text-xs text-muted-foreground">Nasabah</p>
              <p className="font-medium text-foreground">{deposit.nasabah_nama ?? `#${deposit.nasabah}`}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tanggal</p>
              <p className="font-medium text-foreground">{formatDateWIT(deposit.tanggal)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Petugas</p>
              <p className="font-medium text-foreground">{deposit.petugas_nama ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={getStatusBadgeVariant(deposit.status)}>
                {getStatusLabel(deposit.status)}
              </Badge>
            </div>
          </div>

          {/* Detail Items */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Detail Sampah</h4>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted/60">
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Jenis
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Berat
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Harga/kg
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                        Tidak ada detail sampah.
                      </td>
                    </tr>
                  ) : (
                    details.map((det, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 font-medium text-foreground">
                          {det.kategori_nama ?? `Kategori #${det.kategori}`}
                        </td>
                        <td className="px-4 py-2.5 text-right text-foreground">
                          {formatWeightKg(det.berat_kg)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-foreground">
                          {det.harga_saat_itu ? formatRupiah(det.harga_saat_itu) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                          {det.subtotal ? formatRupiah(det.subtotal) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total & Poin */}
          <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Nilai Setoran</p>
              <p className="text-xl font-bold text-primary">{formatRupiah(deposit.total_nilai)}</p>
            </div>
            {deposit.poin_didapat != null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Poin Didapat</p>
                <p className="text-lg font-semibold text-foreground">{deposit.poin_didapat} poin</p>
              </div>
            )}
          </div>

          {/* Saldo Baru */}
          {deposit.saldo_nasabah_baru && (
            <div className="flex items-center gap-2 rounded-lg bg-surface-muted p-3">
              <User className="size-4 text-muted-foreground" aria-hidden />
              <p className="text-xs text-muted-foreground">
                Saldo nasabah setelah setoran:{' '}
                <span className="font-semibold text-foreground">
                  {formatRupiah(deposit.saldo_nasabah_baru)}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}


// ─── Main Component ───────────────────────────────────────────────

export function DepositHistory({
  title = 'Riwayat Setoran',
  description = 'Daftar setoran sampah nasabah.',
  scopeToCurrentPetugas = false,
}: {
  title?: string
  description?: string
  /** Jika true (atau role petugas), filter API ke petugas yang login. */
  scopeToCurrentPetugas?: boolean
} = {}) {
  const { user } = useAuth()
  const filterByPetugas =
    scopeToCurrentPetugas || user?.role === 'petugas'

  // ── Filters ──
  const [page, setPage] = useState(1)
  // ── Search with debounce ──
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // ── Date filter: petugas default hari ini ──
  const [dateFilter, setDateFilter] = useState(() => {
    if (user?.role === 'petugas') {
      return getTodayWIT()
    }
    return ''
  })
  const [selectedDepositId, setSelectedDepositId] = useState<number | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // ── Build query params (tanpa useMemo — React Compiler) ──
  const params: Record<string, string> = {
    page: String(page),
    page_size: '20',
    ordering: '-tanggal',
  }
  if (debouncedSearch) params.search = debouncedSearch
  if (dateFilter) params.tanggal = dateFilter
  if (filterByPetugas && user?.id != null) params.petugas = String(user.id)

  // ── Fetch with raw response to get pagination meta ──
  const {
    data: fetchResult,
    error: fetchError,
    isLoading: fetchLoading,
    mutate: fetchMutate,
  } = useSWR(
    ['/deposits/', params],
    async ([path, queryParams]) => {
      const url = new URL(`${API_PREFIX}${path}`)
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
        deposits: (envelope.data ?? []) as Deposit[],
        pagination: envelope.meta?.pagination as PaginationMeta | undefined,
      }
    },
    { revalidateOnFocus: true },
  )

  const depositsList = fetchResult?.deposits ?? []
  const paginationMeta = fetchResult?.pagination

  // ── Handlers ──
  function handleDateFilter(value: string) {
    setDateFilter(value)
    setPage(1)
  }

  function handleRowClick(depositId: number) {
    setSelectedDepositId(depositId)
    setShowDetail(true)
  }

  function handleCloseDetail() {
    setShowDetail(false)
    setSelectedDepositId(null)
  }

  // ── Loading state ──
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <TableSkeleton rows={8} cols={5} />
      </div>
    )
  }

  // ── Error state ──
  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <ErrorMessage
          title="Gagal memuat riwayat"
          message="Tidak dapat memuat data setoran. Periksa koneksi ke server."
          onRetry={() => fetchMutate()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fetchMutate()}
          disabled={fetchLoading}
        >
          <FileText className="size-4" aria-hidden />
          Muat Ulang
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Cari Nasabah"
              placeholder="Cari berdasarkan nama..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
              }}
              onBlur={(e) => {
                setDebouncedSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="w-full sm:w-50">
            <Input
              label="Filter Tanggal"
              type="date"
              value={dateFilter}
              onChange={(e) => handleDateFilter(e.target.value)}
            />
          </div>
          {dateFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDateFilter('')}
              className="mb-0.5"
            >
              Hapus Filter
            </Button>
          )}
          {user?.role === 'petugas' && !dateFilter && (
            <p className="text-xs text-muted-foreground sm:pb-1">
              <Calendar className="mr-1 inline size-3" aria-hidden />
              Menampilkan setoran hari ini (default petugas)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nasabah</TableHead>
                <TableHead>Petugas</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depositsList.length === 0 ? (
                <TableEmpty
                  colSpan={5}
                  message={
                    searchQuery || dateFilter
                      ? 'Tidak ada setoran yang sesuai filter.'
                      : 'Belum ada setoran.'
                  }
                />
              ) : (
                depositsList.map((deposit) => (
                  <TableRow
                    key={deposit.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(deposit.id)}
                  >
                    <TableCell className="whitespace-nowrap">
                      {formatDateWIT(deposit.tanggal, { dateStyle: 'medium' })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {deposit.nasabah_nama ?? `#${deposit.nasabah}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {deposit.petugas_nama ?? '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatRupiah(deposit.total_nilai)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(deposit.status)}>
                        {getStatusLabel(deposit.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <PaginationControls
          meta={paginationMeta}
          page={page}
          onPageChange={setPage}
        />
      </Card>

      {/* Detail Modal */}
      <DetailDepositModal
        depositId={selectedDepositId}
        open={showDetail}
        onClose={handleCloseDetail}
      />
    </div>
  )
}
