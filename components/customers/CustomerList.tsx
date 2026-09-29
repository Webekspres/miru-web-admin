'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { API_PREFIX } from '@/lib/config'
import { formatRupiah } from '@/lib/format'
import { csvRow } from '@/lib/csv'
import { canExportContactData, canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { Select } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { useToast } from '@/components/feedback/Toast'
import { formatWilayah, useWilayah } from '@/hooks/useWilayah'
import {
  Download,
  FileText,
  Plus,
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

/**
 * Export array of objects to CSV file and trigger download.
 * `withContact` = false → tanpa No. HP / alamat / RT / RW (peran pemantauan).
 */
export function customersToCsv(data: CustomerRow[], withContact: boolean): string {
  const columns: { label: string; value: (c: CustomerRow) => unknown; contact?: boolean }[] = [
    { label: 'ID', value: (c) => c.id },
    { label: 'Nama Lengkap', value: (c) => c.nama_lengkap },
    { label: 'No. HP', value: (c) => c.no_hp ?? '', contact: true },
    { label: 'Alamat', value: (c) => c.alamat ?? '', contact: true },
    { label: 'Kelurahan', value: (c) => c.kelurahan_nama ?? '' },
    { label: 'RT', value: (c) => c.rt ?? '', contact: true },
    { label: 'RW', value: (c) => c.rw ?? '', contact: true },
    { label: 'Saldo', value: (c) => c.saldo ?? '0' },
    { label: 'Poin', value: (c) => c.poin ?? 0 },
    { label: 'Status', value: (c) => (c.is_active ? 'Aktif' : 'Nonaktif') },
  ]
  const used = columns.filter((col) => withContact || !col.contact)
  return [
    csvRow(used.map((col) => col.label)),
    ...data.map((c) => csvRow(used.map((col) => col.value(c)))),
  ].join('\n')
}

function exportToCSV(data: CustomerRow[], withContact: boolean, filename = 'nasabah.csv') {
  const csvContent = customersToCsv(data, withContact)

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
  kelurahan_nama?: string | null
  rt?: string
  rw?: string
  saldo?: string
  poin?: number
  is_active: boolean
  phone_verified?: boolean
  avatar_url?: string | null
}

function toCustomerRows(users: User[]): CustomerRow[] {
  return users
    .filter((u) => u.role === 'nasabah')
    .map((u) => ({
      id: u.id,
      nama_lengkap: u.nama_lengkap,
      no_hp: u.no_hp,
      alamat: u.alamat,
      kelurahan_nama: u.kelurahan_nama,
      rt: u.rt,
      rw: u.rw,
      saldo: u.saldo,
      poin: u.poin,
      is_active: u.is_active,
      phone_verified: u.phone_verified,
      avatar_url: u.avatar_url,
    }))
}

const FETCH_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'Accept-Language': 'id',
}



// ─── Main Component ───────────────────────────────────────────────

export function CustomerList() {
  const router = useRouter()
  const { role: authRole } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()

  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [kelurahanFilter, setKelurahanFilter] = useState('')
  const { options: wilayahOptions } = useWilayah()

  const canWrite = authRole ? canMutate(authRole) : false

  // ── Build query params ──
  const params = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      page_size: '20',
      role: 'nasabah',
    }
    if (debouncedSearch) p.search = debouncedSearch
    if (kelurahanFilter) p.kelurahan = kelurahanFilter
    return p
  }, [page, debouncedSearch, kelurahanFilter])

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
      const res = await fetch(url.toString(), {
        credentials: 'include',
        headers: FETCH_HEADERS,
      })
      const envelope = await res.json()

      return {
        customers: toCustomerRows((envelope.data ?? []) as User[]),
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
      // Backend membatasi page_size maks 100 — ambil semua halaman.
      const allUsers: CustomerRow[] = []
      for (let exportPage = 1; ; exportPage++) {
        const url = new URL(`${API_PREFIX}/users/`)
        url.searchParams.set('role', 'nasabah')
        url.searchParams.set('page_size', '100')
        url.searchParams.set('page', String(exportPage))
        if (debouncedSearch) url.searchParams.set('search', debouncedSearch)
        if (kelurahanFilter) url.searchParams.set('kelurahan', kelurahanFilter)
        const res = await fetch(url.toString(), {
          credentials: 'include',
          headers: FETCH_HEADERS,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const envelope = await res.json()
        allUsers.push(...toCustomerRows((envelope.data ?? []) as User[]))
        const meta = envelope.meta?.pagination as PaginationMeta | undefined
        if (!meta || exportPage >= meta.total_pages) break
      }

      exportToCSV(
        allUsers,
        authRole ? canExportContactData(authRole) : false,
        `nasabah_${new Date().toISOString().split('T')[0]}.csv`,
      )
      toastSuccess('Data nasabah berhasil diekspor.')
    } catch {
      toastError('Gagal mengekspor semua data. Mengekspor halaman saat ini.')
      exportToCSV(
        customers,
        authRole ? canExportContactData(authRole) : false,
        `nasabah_${new Date().toISOString().split('T')[0]}.csv`,
      )
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
        <TableSkeleton rows={8} cols={7} />
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
            title={
              authRole && !canExportContactData(authRole)
                ? 'Tanpa kolom kontak (No. HP, alamat, RT/RW) sesuai hak akses Anda'
                : undefined
            }
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
          <div className="sm:w-64">
            <Select
              label="Kelurahan"
              id="filter-kelurahan"
              value={kelurahanFilter}
              onChange={(e) => {
                setKelurahanFilter(e.target.value)
                setPage(1)
              }}
              options={[{ value: '', label: 'Semua kelurahan' }, ...wilayahOptions]}
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
                <TableHead>Kelurahan</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Poin</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableEmpty
                  colSpan={7}
                  message={
                    debouncedSearch || kelurahanFilter
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
                        <UserAvatar
                          src={customer.avatar_url}
                          name={customer.nama_lengkap}
                          size="sm"
                        />
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
                      {customer.alamat || '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {customer.kelurahan_nama ? formatWilayah(customer) : '—'}
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
