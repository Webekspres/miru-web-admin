'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { formatDateWIT, formatRupiah } from '@/lib/format'
import { canMutate } from '@/lib/permissions'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  Gift,
  MapPin,
  Phone,
  Wallet,
  XCircle,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import type { User, Deposit, Withdrawal, RewardRedemption } from '@/types/models'

// ─── Types ────────────────────────────────────────────────────────

type TabKey = 'deposits' | 'withdrawals' | 'redemptions'

interface TabDefinition {
  key: TabKey
  label: string
}

const TABS: TabDefinition[] = [
  { key: 'deposits', label: 'Setoran' },
  { key: 'withdrawals', label: 'Penarikan' },
  { key: 'redemptions', label: 'Penukaran Poin' },
]

// ─── Helpers ──────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case 'selesai':
      return 'success' as const
    case 'dibatalkan':
    case 'ditolak':
      return 'danger' as const
    case 'menunggu':
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
    ditolak: 'Ditolak',
    menunggu: 'Menunggu',
    diproses: 'Diproses',
  }
  return labels[status] ?? status
}

// ─── Main Component ───────────────────────────────────────────────

export function CustomerDetail({ customerId }: { customerId: number }) {
  const router = useRouter()
  const { role: authRole } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const [activeTab, setActiveTab] = useState<TabKey>('deposits')

  const canWrite = authRole ? canMutate(authRole) : false

  // ── Fetch customer profile ──
  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
    mutate: profileMutate,
  } = useSWR(
    `/users/${customerId}/`,
    (path) => api.get<User>(path),
    { revalidateOnFocus: false },
  )

  // ── Toggle active/inactive ──
  async function handleToggleActive() {
    if (!profile) return
    try {
      await api.patch(`/users/${customerId}/`, { is_active: !profile.is_active })
      toastSuccess(
        profile.is_active
          ? 'Nasabah berhasil dinonaktifkan.'
          : 'Nasabah berhasil diaktifkan.',
      )
      profileMutate()
    } catch {
      toastError('Gagal mengubah status nasabah.')
    }
  }

  // ── Tab data ──
  const tabQueries: Record<TabKey, string | null> = {
    deposits: `/deposits/?nasabah=${customerId}&ordering=-tanggal`,
    withdrawals: `/withdrawals/?nasabah=${customerId}&ordering=-tanggal`,
    redemptions: `/reward-redemptions/?nasabah=${customerId}&ordering=-tanggal`,
  }

  const queryKey = tabQueries[activeTab]
  const { data: tabData, isLoading: tabLoading } = useSWR(
    queryKey,
    (path) => api.get<unknown[]>(path),
    { revalidateOnFocus: false },
  )

  // ── Loading ──
  if (profileLoading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={4} cols={2} />
      </div>
    )
  }

  // ── Error ──
  if (profileError || !profile) {
    return (
      <div className="space-y-6">
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/customers')}>
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke Daftar Nasabah
        </Button>
        <ErrorMessage
          title="Nasabah tidak ditemukan"
          message="Data nasabah tidak dapat dimuat. Mungkin sudah dihapus atau ID tidak valid."
          onRetry={() => profileMutate()}
        />
      </div>
    )
  }

  const tabItems = (tabData ?? []) as unknown[]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/customers')}>
        <ArrowLeft className="size-4" aria-hidden />
        Kembali ke Daftar Nasabah
      </Button>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: Avatar & Name */}
            <div className="flex items-center gap-4">
              <UserAvatar
                src={profile.avatar_url}
                name={profile.nama_lengkap}
                size="md"
                className="size-16"
              />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{profile.nama_lengkap}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={profile.is_active ? 'success' : 'default'}>
                    {profile.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  {profile.no_hp && profile.phone_verified === false && (
                    <Badge variant="warning" title="Nomor HP akan diverifikasi saat user login di aplikasi mobile">
                      HP Belum Verifikasi
                    </Badge>
                  )}
                  <Badge variant="default">Nasabah</Badge>
                  {profile.date_joined && (
                    <span className="text-xs text-muted-foreground">
                      Bergabung {formatDateWIT(profile.date_joined, { dateStyle: 'medium' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {canWrite && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/customers/${customerId}/edit`)}
                  >
                    <Edit className="size-4" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant={profile.is_active ? 'outline' : 'primary'}
                    size="sm"
                    onClick={handleToggleActive}
                  >
                    {profile.is_active ? (
                      <>
                        <XCircle className="size-4" aria-hidden />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" aria-hidden />
                        Aktifkan
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-surface-muted p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="size-4" aria-hidden />
                Saldo
              </div>
              <p className="mt-1 text-lg font-bold text-foreground">
                {profile.saldo ? formatRupiah(profile.saldo) : 'Rp0,00'}
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gift className="size-4" aria-hidden />
                Poin
              </div>
              <p className="mt-1 text-lg font-bold text-foreground">
                {profile.poin ?? 0} poin
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden />
                Alamat
              </div>
              <p className="mt-1 text-sm text-foreground">{profile.alamat ?? '—'}</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4" aria-hidden />
                No. HP
              </div>
              <p className="mt-1 text-sm text-foreground">{profile.no_hp ?? '—'}</p>
              {profile.no_hp && profile.phone_verified === false && (
                <p className="mt-1 text-xs text-warning">
                  Belum verifikasi — akan diverifikasi saat login mobile.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Deposits, Withdrawals, Redemptions */}
      <Card>
        <CardHeader className="border-b border-border pb-0">
          <div className="flex gap-1" role="tablist" aria-label="Riwayat transaksi nasabah">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
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
          {tabLoading ? (
            <div className="p-4">
              <TableSkeleton rows={4} cols={4} />
            </div>
          ) : (
            <>
              {activeTab === 'deposits' && (
                <DepositTable items={tabItems as Deposit[]} />
              )}
              {activeTab === 'withdrawals' && (
                <WithdrawalTable items={tabItems as Withdrawal[]} />
              )}
              {activeTab === 'redemptions' && (
                <RedemptionTable items={tabItems as RewardRedemption[]} />
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

// ─── Deposit Table ────────────────────────────────────────────────

function DepositTable({ items }: { items: Deposit[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>Petugas</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableEmpty colSpan={4} message="Belum ada setoran." />
        ) : (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="whitespace-nowrap">
                {formatDateWIT(item.tanggal, { dateStyle: 'medium' })}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {item.petugas_nama ?? '—'}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatRupiah(item.total_nilai)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadge(item.status)}>
                  {getStatusLabel(item.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

// ─── Withdrawal Table ─────────────────────────────────────────────

function WithdrawalTable({ items }: { items: Withdrawal[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead className="text-right">Nominal</TableHead>
          <TableHead>Metode</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableEmpty colSpan={4} message="Belum ada penarikan." />
        ) : (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="whitespace-nowrap">
                {formatDateWIT(item.tanggal, { dateStyle: 'medium' })}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatRupiah(item.nominal)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {item.metode}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadge(item.status)}>
                  {getStatusLabel(item.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

// ─── Redemption Table ─────────────────────────────────────────────

function RedemptionTable({ items }: { items: RewardRedemption[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>Reward</TableHead>
          <TableHead className="text-right">Poin</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableEmpty colSpan={4} message="Belum ada penukaran poin." />
        ) : (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="whitespace-nowrap">
                {formatDateWIT(item.tanggal, { dateStyle: 'medium' })}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {item.reward_nama ?? `Reward #${item.reward}`}
              </TableCell>
              <TableCell className="text-right text-foreground">
                {item.poin_dibutuhkan ?? 0} poin
              </TableCell>
              <TableCell>
                <Badge variant={item.status === 'selesai' ? 'success' : 'warning'}>
                  {item.status === 'selesai' ? 'Selesai' : 'Menunggu'}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
