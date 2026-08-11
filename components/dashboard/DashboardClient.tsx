'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatDateWIT, formatRupiah, formatWeightKg } from '@/lib/format'
import { useAuth } from '@/providers/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  DollarSign,
  MessageSquare,
  Package,
  Recycle,
  Scale,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Complaint } from '@/types/models'

// ─── Types ───────────────────────────────────────────────────────

interface DashboardOverview {
  total_nasabah: number
  nasabah_aktif_30_hari: number
  total_sampah_kg: string
  total_nilai_setoran: string
  total_penarikan: string
  total_penukaran_poin: number
  penjemputan_menunggu: number
  pengaduan_terbuka: number
  stok_per_kategori: { nama: string; stok: string }[]
}

/** Ringkasan widget untuk role petugas (T9 / W9). */
interface PetugasOverview {
  role: 'petugas'
  jemput_ditugaskan_hari_ini: number
  antrian_aktif: number
}

interface ChartDay {
  tanggal: string
  total_nilai: string
  total_berat_kg: string
  jumlah_transaksi: number
}

interface DepositChart {
  bulan: number
  tahun: number
  data: ChartDay[]
}

interface ActivityItem {
  type: string
  id: number
  tanggal: string
  nasabah: string | null
  nominal?: string
  estimasi_berat_kg?: string
  status: string
}

// ─── Helpers ──────────────────────────────────────────────────────

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const ACTIVITY_LABELS: Record<string, string> = {
  setoran: 'Setoran',
  penarikan: 'Penarikan',
  penjemputan: 'Penjemputan',
}

const ACTIVITY_ICONS: Record<string, typeof TrendingUp> = {
  setoran: TrendingUp,
  penarikan: DollarSign,
  penjemputan: Truck,
}

// ─── Sub-Component: Greeting ──────────────────────────────────────

function GreetingBanner({ name }: { name: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        Selamat datang, <span className="text-primary">{name}</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ringkasan program bank sampah hari ini.
      </p>
    </div>
  )
}

// ─── Sub-Component: Stat Card ─────────────────────────────────────

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  variant?: 'default' | 'warning' | 'danger'
}

function StatCard({ title, value, subtitle, icon, variant = 'default' }: StatCardProps) {
  const valueColor = {
    default: 'text-foreground',
    warning: 'text-warning',
    danger: 'text-danger',
  }[variant]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

// ─── Sub-Component: Overview Cards ────────────────────────────────

function OverviewCards({ data }: { data: DashboardOverview }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Nasabah"
        value={data.total_nasabah.toLocaleString('id-ID')}
        subtitle={`${data.nasabah_aktif_30_hari} aktif 30 hari`}
        icon={<Users className="size-5" aria-hidden />}
      />
      <StatCard
        title="Sampah Terkumpul"
        value={formatWeightKg(data.total_sampah_kg)}
        subtitle={`Nilai: ${formatRupiah(data.total_nilai_setoran)}`}
        icon={<Recycle className="size-5" aria-hidden />}
      />
      <StatCard
        title="Penjemputan Menunggu"
        value={data.penjemputan_menunggu.toLocaleString('id-ID')}
        subtitle="Perlu diproses admin"
        icon={<Truck className="size-5" aria-hidden />}
        variant={data.penjemputan_menunggu > 0 ? 'warning' : 'default'}
      />
      <StatCard
        title="Pengaduan Terbuka"
        value={data.pengaduan_terbuka.toLocaleString('id-ID')}
        subtitle="Menunggu tindak lanjut"
        icon={<MessageSquare className="size-5" aria-hidden />}
        variant={data.pengaduan_terbuka > 0 ? 'danger' : 'default'}
      />
    </div>
  )
}

// ─── Sub-Component: Deposit Chart ─────────────────────────────────

function DepositChartView({ bulan, tahun }: { bulan: number; tahun: number }) {
  // Navigation for prev/next month
  const [viewMonth, setViewMonth] = useState(bulan)
  const [viewYear, setViewYear] = useState(tahun)

  const { data, error, isLoading } = useSWR(
    `/dashboard/deposit-chart/?bulan=${viewMonth}&tahun=${viewYear}`,
    (path) => api.get<DepositChart>(path),
    { revalidateOnFocus: false },
  )

  // Format chart data
  const chartData = useMemo(() => {
    if (!data?.data) return []
    return data.data.map((day) => {
      const [, , date] = day.tanggal.split('-')
      return {
        date: `${parseInt(date)}`,
        nilai: parseFloat(day.total_nilai),
        berat: parseFloat(day.total_berat_kg),
        transaksi: day.jumlah_transaksi,
      }
    })
  }, [data])

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1) }
    else { setViewMonth(viewMonth - 1) }
  }

  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1) }
    else { setViewMonth(viewMonth + 1) }
  }

  if (isLoading) return <div className="h-64"><TableSkeleton rows={4} cols={1} /></div>
  if (error) return <ErrorMessage title="Gagal memuat grafik" message="Tidak dapat memuat data chart setoran." />

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="size-5 text-primary" aria-hidden />
          Setoran {MONTHS[viewMonth - 1]} {viewYear}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={prevMonth}>&larr;</Button>
          <span className="text-sm text-muted-foreground min-w-20 text-center">{MONTHS[viewMonth - 1]}</span>
          <Button type="button" variant="ghost" size="sm" onClick={nextMonth}>&rarr;</Button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Belum ada data setoran untuk bulan ini.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  labelFormatter={(label) => `${MONTHS[viewMonth - 1]} ${label}, ${viewYear}`}
                  formatter={(value, name) => {
                    const v = Number(value)
                    if (name === 'nilai') return [formatRupiah(v), 'Nilai Setoran']
                    if (name === 'berat') return [formatWeightKg(v), 'Berat']
                    if (name === 'transaksi') return [v, 'Transaksi']
                    return [v, name]
                  }}
                />
                <Bar dataKey="berat" name="berat" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Sub-Component: Recent Activity ────────────────────────────────

function RecentActivity({ items, isLoading }: { items: ActivityItem[]; isLoading: boolean }) {
  if (isLoading) return <TableSkeleton rows={5} cols={3} />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-5 text-primary" aria-hidden />
          Aktivitas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">Belum ada aktivitas.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item, idx) => {
              const Icon = ACTIVITY_ICONS[item.type] ?? TrendingUp
              const label = ACTIVITY_LABELS[item.type] ?? item.type
              return (
                <li key={`${item.type}-${item.id}-${idx}`} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {label}
                      {item.nasabah && <span className="text-muted-foreground"> — {item.nasabah}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.nominal && `${formatRupiah(item.nominal)}`}
                      {item.estimasi_berat_kg && `${formatWeightKg(item.estimasi_berat_kg)}`}
                    </p>
                  </div>
                  <Badge variant={item.status === 'selesai' ? 'success' : item.status === 'menunggu' ? 'warning' : 'default'}>
                    {item.status}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Sub-Component: Open Complaints ──────────────────────────────

function OpenComplaints({ complaints, isLoading }: { complaints: Complaint[]; isLoading: boolean }) {
  if (isLoading) return <TableSkeleton rows={4} cols={2} />

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-5 text-primary" aria-hidden />
          Pengaduan Terbuka
        </CardTitle>
        <Link href="/complaints">
          <Button type="button" variant="ghost" size="sm">
            Lihat Semua
            <ArrowRight className="ml-1 size-3.5" aria-hidden />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {complaints.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">Tidak ada pengaduan terbuka.</p>
        ) : (
          <ul className="divide-y divide-border">
            {complaints.map((c) => (
              <li key={c.id} className="flex items-start gap-3 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-danger/10">
                  <AlertTriangle className="size-4 text-danger" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {c.nasabah_nama ?? `Nasabah #${c.nasabah}`}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{c.keluhan}</p>
                </div>
                <Link href={`/complaints`} className="shrink-0">
                  <Button type="button" variant="ghost" size="sm">
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Sub-Component: Stock Summary ──────────────────────────────────

function StockMiniSummary() {
  const { data: inventory, isLoading } = useSWR(
    '/inventory/',
    (path) => api.get<{
      total_stok_kg: string
      total_estimasi_nilai: string
      kategori: { nama: string; stok_terkini_kg: string; estimasi_nilai: string }[]
    }>(path),
    { revalidateOnFocus: false },
  )

  const topCategories = inventory?.kategori
    ? [...inventory.kategori]
        .sort((a, b) => parseFloat(b.stok_terkini_kg) - parseFloat(a.stok_terkini_kg))
        .slice(0, 5)
    : []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="size-5 text-primary" aria-hidden />
          Ringkasan Stok
        </CardTitle>
        <Link href="/warehouse">
          <Button type="button" variant="ghost" size="sm">
            Lihat Semua
            <ArrowRight className="ml-1 size-3.5" aria-hidden />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-4 pb-4"><TableSkeleton rows={4} cols={2} /></div>
        ) : topCategories.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">Belum ada data stok.</p>
        ) : (
          <ul className="divide-y divide-border">
            {topCategories.map((cat) => (
              <li key={cat.nama} className="flex items-center gap-3 px-4 py-2.5">
                <Scale className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{cat.nama}</span>
                <span className="text-sm font-semibold text-foreground">{formatWeightKg(cat.stok_terkini_kg)}</span>
              </li>
            ))}
            {inventory && (
              <li className="flex items-center justify-between bg-surface-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
                <span>Total nilai stok</span>
                <span className="font-semibold">{formatRupiah(inventory.total_estimasi_nilai)}</span>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Petugas Dashboard (W9) ───────────────────────────────────────

const PETUGAS_TASK_STATUSES = 'dijadwalkan,dalam_perjalanan,dijemput'

interface PetugasTask {
  id: number
  nasabah?: number
  nasabah_nama?: string
  alamat_jemput: string
  jadwal: string
  status: string
}

function PetugasDashboard({ user }: { user: { id: number; nama_lengkap: string } }) {
  const { data: overview, error, isLoading, mutate } = useSWR(
    '/dashboard/overview/',
    (path) => api.get<PetugasOverview>(path),
    { revalidateOnFocus: true },
  )

  const { data: tasks, isLoading: tasksLoading } = useSWR(
    `/pickups/?petugas=${user.id}&status__in=${PETUGAS_TASK_STATUSES}&page_size=20&ordering=jadwal`,
    (path) => api.get<PetugasTask[]>(path),
    { revalidateOnFocus: true },
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <GreetingBanner name={user.nama_lengkap} />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-20 animate-pulse rounded-lg bg-surface-muted" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <GreetingBanner name={user.nama_lengkap} />
        <ErrorMessage title="Gagal memuat data dashboard" message="Tidak dapat memuat ringkasan dashboard petugas." onRetry={() => mutate()} />
      </div>
    )
  }

  const taskList = tasks ?? []
  const taskStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      dijadwalkan: 'Dijadwalkan',
      dalam_perjalanan: 'Dalam Perjalanan',
      dijemput: 'Dijemput',
    }
    return labels[status] ?? status
  }

  return (
    <div className="space-y-6">
      <GreetingBanner name={user.nama_lengkap} />

      {/* Widget petugas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <StatCard
          title="Jemput Ditugaskan Hari Ini"
          value={String(overview?.jemput_ditugaskan_hari_ini ?? 0)}
          subtitle="Penjemputan yang harus dikerjakan hari ini"
          icon={<Truck className="size-5" aria-hidden />}
        />
        <StatCard
          title="Antrian Aktif"
          value={String(overview?.antrian_aktif ?? 0)}
          subtitle="Total tugas yang belum selesai"
          icon={<Users className="size-5" aria-hidden />}
          variant={overview && overview.antrian_aktif > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Tugas hari ini */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="size-5 text-primary" aria-hidden />
            Tugas Penjemputan Saya
          </CardTitle>
          <Link href="/pickups">
            <Button type="button" variant="ghost" size="sm">
              Lihat Semua
              <ArrowRight className="ml-1 size-3.5" aria-hidden />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {tasksLoading ? (
            <div className="px-4 pb-4"><TableSkeleton rows={4} cols={3} /></div>
          ) : taskList.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
              Tidak ada penjemputan yang ditugaskan saat ini.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {taskList.map((task) => (
                <li key={task.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="size-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {task.nasabah_nama ?? `Nasabah #${task.nasabah}`}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{task.alamat_jemput}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateWIT(task.jadwal, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <Badge variant={task.status === 'dijemput' ? 'primary' : task.status === 'dalam_perjalanan' ? 'warning' : 'default'}>
                    {taskStatusLabel(task.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Admin / Koordinator / Pemerintah Dashboard ──────────────────

function AdminDashboardContent({ userName }: { userName: string }) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // ── Fetch overview ──
  const { data: overview, error: overviewError, isLoading: overviewLoading, mutate: mutateOverview } = useSWR(
    '/dashboard/overview/',
    (path) => api.get<DashboardOverview>(path),
    { revalidateOnFocus: true },
  )

  // ── Fetch recent activity ──
  const { data: activity, isLoading: activityLoading } = useSWR(
    '/dashboard/recent-activity/?limit=10',
    (path) => api.get<ActivityItem[]>(path),
    { revalidateOnFocus: true },
  )

  // ── Fetch open complaints ──
  const { data: complaints, isLoading: complaintsLoading } = useSWR(
    '/complaints/?status=terbuka&page_size=5',
    (path) => api.get<Complaint[]>(path),
    { revalidateOnFocus: true },
  )

  // ── Global loading ──
  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <GreetingBanner name={userName} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-20 animate-pulse rounded-lg bg-surface-muted" /></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
        </div>
      </div>
    )
  }

  // ── Error ──
  if (overviewError) {
    return (
      <div className="space-y-6">
        <GreetingBanner name={userName} />
        <ErrorMessage title="Gagal memuat data dashboard" message="Tidak dapat memuat ringkasan dashboard." onRetry={() => mutateOverview()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <GreetingBanner name={userName} />

      {/* Overview Cards */}
      {overview && <OverviewCards data={overview} />}

      {/* Chart + Side Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DepositChartView bulan={currentMonth} tahun={currentYear} />
        </div>
        <div className="space-y-6">
          <RecentActivity items={activity ?? []} isLoading={activityLoading} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OpenComplaints
          complaints={complaints ?? []}
          isLoading={complaintsLoading}
        />
        <StockMiniSummary />
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────

export function DashboardClient() {
  const { user } = useAuth()
  const userName = user?.nama_lengkap ?? 'User'

  // W9: petugas dapat dashboard khusus (widget jemput ditugaskan / antrian)
  if (user?.role === 'petugas' && user.id) {
    return (
      <PetugasDashboard
        user={{ id: user.id, nama_lengkap: userName }}
      />
    )
  }

  return <AdminDashboardContent userName={userName} />
}
