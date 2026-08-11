'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { getAccessToken } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import { formatDateWIT } from '@/lib/format'
import { useAuth } from '@/providers/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  Edit,
  FileText,
  Plus,
  Shield,
  ShieldCheck,
  User as UserIcon,
  UserCheck,
  UserX,
} from 'lucide-react'
import type { StaffRole, User } from '@/types/models'
import type { PaginationMeta } from '@/types/api'

// ─── Constants ────────────────────────────────────────────────────


interface StaffTab {
  key: StaffRole
  label: string
}

const ROLE_TABS: StaffTab[] = [
  { key: 'petugas', label: 'Petugas' },
  { key: 'admin', label: 'Admin' },
  { key: 'koordinator', label: 'Koordinator' },
]

const ROLE_BADGE_VARIANTS: Record<StaffRole, 'primary' | 'warning' | 'default'> = {
  petugas: 'primary',
  admin: 'warning',
  koordinator: 'default',
}

// ─── Helpers ──────────────────────────────────────────────────────

function getStatusBadge(isActive: boolean) {
  return isActive ? 'success' as const : 'default' as const
}

function getStatusLabel(isActive: boolean): string {
  return isActive ? 'Aktif' : 'Nonaktif'
}

function getRoleLabel(role: StaffRole): string {
  const labels: Record<StaffRole, string> = {
    petugas: 'Petugas Bank Sampah',
    admin: 'Admin Aplikasi',
    koordinator: 'Koordinator Program',
  }
  return labels[role] ?? role
}



// ─── Main Component ───────────────────────────────────────────────

export function StaffList() {
  const router = useRouter()
  const { user: authUser } = useAuth()

  const [activeTab, setActiveTab] = useState<StaffRole>('petugas')
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const isAdmin = authUser?.role === 'admin'

  // ── Build query params ──
  const params = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      page_size: '20',
      role: activeTab,
    }
    if (debouncedSearch) p.search = debouncedSearch
    return p
  }, [page, activeTab, debouncedSearch])

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

      const staffList = ((envelope.data ?? []) as User[])
        .filter((u) => u.role === activeTab)
        .map((u) => ({
          id: u.id,
          username: u.username,
          nama_lengkap: u.nama_lengkap,
          no_hp: u.no_hp,
          is_active: u.is_active,
          role: u.role as StaffRole,
          date_joined: u.date_joined,
        }))

      return {
        staff: staffList,
        pagination: envelope.meta?.pagination as PaginationMeta | undefined,
      }
    },
    { revalidateOnFocus: true },
  )

  const staff = fetchResult?.staff ?? []
  const paginationMeta = fetchResult?.pagination

  // ── Tab change ──
  function handleTabChange(tab: StaffRole) {
    setActiveTab(tab)
    setPage(1)
    setSearchQuery('')
    setDebouncedSearch('')
  }

  // ── Navigate to edit page ──
  function handleEdit(staffId: number) {
    router.push(`/staff/${staffId}/edit`)
  }

  // ── Loading ──
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Petugas & Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manajemen akun petugas, admin, dan koordinator bank sampah.
          </p>
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
          <h1 className="text-2xl font-semibold text-foreground">Petugas & Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manajemen akun petugas, admin, dan koordinator bank sampah.
          </p>
        </div>
        <ErrorMessage
          title="Gagal memuat data"
          message="Tidak dapat memuat data staff. Periksa koneksi ke server."
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
          <h1 className="text-2xl font-semibold text-foreground">Petugas & Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manajemen akun petugas, admin, dan koordinator bank sampah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button type="button" onClick={() => router.push('/staff/add')}>
              <Plus className="size-4" aria-hidden />
              Tambah Staff
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => fetchMutate()} disabled={fetchLoading}>
            <FileText className="size-4" aria-hidden />
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Tabs + Table */}
      <Card>
        {/* Role Tabs */}
        <CardHeader className="border-b border-border pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1" role="tablist" aria-label="Filter role staff">
              {ROLE_TABS.map((tab) => (
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
            {/* Search */}
            <div className="w-full sm:w-64">
              <Input
                placeholder="Cari staff..."
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
        </CardHeader>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableEmpty
                  colSpan={isAdmin ? 7 : 6}
                  message={
                    debouncedSearch
                      ? 'Staff tidak ditemukan.'
                      : `Belum ada ${activeTab} terdaftar.`
                  }
                />
              ) : (
                staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                          {member.role === 'admin' ? (
                            <ShieldCheck className="size-4 text-warning" aria-hidden />
                          ) : member.role === 'koordinator' ? (
                            <Shield className="size-4 text-primary" aria-hidden />
                          ) : (
                            <UserIcon className="size-4 text-muted-foreground" aria-hidden />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{member.nama_lengkap}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">@{member.username}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_BADGE_VARIANTS[member.role]}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.no_hp ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {member.date_joined
                        ? formatDateWIT(member.date_joined, { dateStyle: 'medium' })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(member.is_active)}>
                        {member.is_active ? (
                          <UserCheck className="mr-1 inline size-3" aria-hidden />
                        ) : (
                          <UserX className="mr-1 inline size-3" aria-hidden />
                        )}
                        {getStatusLabel(member.is_active)}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member.id)}
                          >
                            <Edit className="size-4" aria-hidden />
                            Edit
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
    </div>
  )
}
