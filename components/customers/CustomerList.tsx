'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { getAccessToken } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import { formatRupiah } from '@/lib/format'
import { canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { useToast } from '@/components/feedback/Toast'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Plus,
  User as UserIcon,
  UserCheck,
  UserX,
} from 'lucide-react'
import type { User } from '@/types/models'
import type { PaginationMeta } from '@/types/api'

// ─── Helpers ──────────────────────────────────────────────────────

function getStatusBadge(isActive: boolean) {
  return isActive ? 'success' as const : 'default' as const
}

function getStatusLabel(isActive: boolean): string {
  return isActive ? 'Aktif' : 'Nonaktif'
}

/** Export array of objects to CSV file and trigger download */
function exportToCSV(data: CustomerRow[], filename = 'nasabah.csv') {
  const headers = ['ID', 'Nama Lengkap', 'No. HP', 'Alamat', 'Saldo', 'Poin', 'Status']
  const rows = data.map((c) => [
    String(c.id),
    c.nama_lengkap,
    c.no_hp ?? '',
    c.alamat ?? '',
    c.saldo ?? '0',
    String(c.poin ?? 0),
    c.is_active ? 'Aktif' : 'Nonaktif',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Types ────────────────────────────────────────────────────────

interface CustomerRow {
  id: number
  nama_lengkap: string
  no_hp?: string
  alamat?: string
  saldo?: string
  poin?: number
  is_active: boolean
  phone_verified?: boolean
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

// ─── Main Component ───────────────────────────────────────────────

export function CustomerList() {
  const router = useRouter()
  const { role: authRole } = useAuth()
  const { success: toastSuccess } = useToast()

  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const canWrite = authRole ? canMutate(authRole) : false

  // ── Build query params ──
  const params = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      page_size: '20',
      role: 'nasabah',
    }
    if (debouncedSearch) p.search = debouncedSearch
    return p
  }, [page, debouncedSearch])

  // ── Fetch with raw response ──
  const {
    data: fetchResult,
    error: fetchError,
    isLoading: fetchLoading,
    mutate: fetchMutate,
  } = useSWR(
    ['/users/', params],
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

      const users = ((envelope.data ?? []) as User[])
        .filter((u) => u.role === 'nasabah')
        .map((u) => ({
          id: u.id,
          nama_lengkap: u.nama_lengkap,
          no_hp: u.no_hp,
          alamat: u.alamat,
          saldo: u.saldo,
          poin: u.poin,
          is_active: u.is_active,
          phone_verified: u.phone_verified,
        }))

      return {
        customers: users,
        pagination: envelope.meta?.pagination as PaginationMeta | undefined,
      }
    },
    { revalidateOnFocus: true },
  )

  const customers = fetchResult?.customers ?? []
  const paginationMeta = fetchResult?.pagination

  // ── Export CSV (fetch all pages) ──
  async function handleExportCSV() {
    try {
      // Fetch all customers (no pagination) for export
      const url = new URL(`${API_PREFIX}/users/`)
      url.searchParams.set('role', 'nasabah')
      url.searchParams.set('page_size', '10000')
      if (debouncedSearch) url.searchParams.set('search', debouncedSearch)
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
      const allUsers = ((envelope.data ?? []) as User[])
        .filter((u) => u.role === 'nasabah')
        .map((u) => ({
          id: u.id,
          nama_lengkap: u.nama_lengkap,
          no_hp: u.no_hp,
          alamat: u.alamat,
          saldo: u.saldo,
          poin: u.poin,
          is_active: u.is_active,
          phone_verified: u.phone_verified,
        }))

      exportToCSV(allUsers, `nasabah_${new Date().toISOString().split('T')[0]}.csv`)
      toastSuccess('Data nasabah berhasil diekspor.')
    } catch {
      toastSuccess('Gagal mengekspor semua data. Mengekspor halaman saat ini.')
      exportToCSV(customers, `nasabah_${new Date().toISOString().split('T')[0]}.csv`)
    }
  }

  // ── Navigate to detail ──
  function handleRowClick(customerId: number) {
    router.push(`/customers/${customerId}`)
  }

  // ── Loading ──
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Nasabah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar nasabah terdaftar di MIRU Bank Sampah.
          </p>
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
          <h1 className="text-2xl font-semibold text-foreground">Nasabah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar nasabah terdaftar di MIRU Bank Sampah.
          </p>
        </div>
        <ErrorMessage
          title="Gagal memuat data"
          message="Tidak dapat memuat data nasabah. Periksa koneksi ke server."
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
          <h1 className="text-2xl font-semibold text-foreground">Nasabah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar nasabah terdaftar di MIRU Bank Sampah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            disabled={customers.length === 0}
          >
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
          {canWrite && (
            <Button
              type="button"
              onClick={() => router.push('/customers/add')}
            >
              <Plus className="size-4" aria-hidden />
              Tambah Nasabah
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => fetchMutate()} disabled={fetchLoading}>
            <FileText className="size-4" aria-hidden />
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Cari Nasabah"
              placeholder="Cari berdasarkan nama atau No. HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={(e) => {
                setDebouncedSearch(e.target.value)
                setPage(1)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setDebouncedSearch(searchQuery)
                  setPage(1)
                }
              }}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Poin</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  message={
                    debouncedSearch
                      ? 'Nasabah tidak ditemukan.'
                      : 'Belum ada nasabah terdaftar.'
                  }
                />
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(customer.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                          <UserIcon className="size-4 text-muted-foreground" aria-hidden />
                        </div>
                        <span className="font-medium text-foreground">{customer.nama_lengkap}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{customer.no_hp ?? '—'}</span>
                        {customer.no_hp && customer.phone_verified === false && (
                          <Badge variant="warning">Belum Verifikasi</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground" title={customer.alamat}>
                      {customer.alamat ?? '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {customer.saldo ? formatRupiah(customer.saldo) : 'Rp0,00'}
                    </TableCell>
                    <TableCell className="text-right text-foreground">{customer.poin ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(customer.is_active)}>
                        {customer.is_active ? (
                          <UserCheck className="mr-1 inline size-3" aria-hidden />
                        ) : (
                          <UserX className="mr-1 inline size-3" aria-hidden />
                        )}
                        {getStatusLabel(customer.is_active)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationControls meta={paginationMeta} page={page} onPageChange={setPage} />
      </Card>
    </div>
  )
}
