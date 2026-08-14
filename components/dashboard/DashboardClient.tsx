'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatDateWIT, formatRupiah, formatWeightKg, MONTHS } from '@/lib/format'
import { useAuth } from '@/providers/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ROLE_LABELS } from '@/lib/navigation'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MessageSquare,
  Package,
  PieChart as PieChartIcon,
  Plus,
  Scale,
  TrendingUp,
  Truck,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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

// ─── Constants & Helpers ─────────────────────────────────────────



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

const DONUT_COLORS = [
  '#16a34a',
  '#0891b2',
  '#f59e0b',
  '#dc2626',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
  '#92400e',
  '#ea580c',
  '#2563eb',
  '#ca8a04',
  '#4f46e5',
]

function donutColor(index: number): string {
  const preset = DONUT_COLORS[index]
  if (preset) return preset
  return `hsl(${Math.round((index * 137.508) % 360)} 62% 42%)`
}

// ─── Sub-Component: Welcome Card (Matching Reference Design) ─────

function WelcomeBanner({ userName, role }: { userName: string; role?: string }) {
  return (
    <Card className="border-primary/20 bg-linear-to-r from-primary/5 via-background to-surface-muted">
      <CardHeader variant="default" className="border-b border-border/60">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
          Selamat Datang 👋
        </CardTitle>
        {/* icon hai sebagai ikon welcome */}
      </CardHeader>
      <CardContent className="py-4">
        <p className="text-sm leading-relaxed text-foreground">
          Halo, <strong className="font-semibold text-primary">{userName}</strong>. Selamat bekerja! Akses Anda:{' '}
          <strong className="font-semibold text-foreground">{role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role : 'Administrator'}</strong>.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Kelola data nasabah, pantau transaksi setoran sampah, dan tindak lanjuti penjemputan hari ini.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Sub-Component: Themed Stat Block (Matching Reference Design) ──

interface StatBlockProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  bgClass: string
  href: string
}

function StatBlock({ title, value, subtitle, icon, bgClass, href }: StatBlockProps) {
  return (
    <div className={`overflow-hidden rounded-xl shadow-md ${bgClass} text-white flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5`}>
      <div className="p-5 flex items-start justify-between">
        <div>
          <p className="text-3xl font-extrabold tracking-tight">{value}</p>
          <p className="mt-1 text-sm font-semibold opacity-95">{title}</p>
          {subtitle && <p className="mt-1 text-xs opacity-80">{subtitle}</p>}
        </div>
        <div className="rounded-lg bg-white/20 p-2.5 backdrop-blur-xs text-white">
          {icon}
        </div>
      </div>

      {/* Bottom strip "More info ->" matching reference design */}
      <Link
        href={href}
        className="flex items-center justify-center gap-1.5 bg-black/25 py-2 px-4 text-xs font-semibold text-white/95 transition-colors hover:bg-black/35 hover:text-white"
      >
        <span>Lihat detail</span>
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  )
}

// ─── Sub-Component: Overview Stat Cards Grid ──────────────────────

function OverviewStatCards({ data }: { data: DashboardOverview }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatBlock
        title="Nasabah Terdaftar"
        value={data.total_nasabah.toLocaleString('id-ID')}
        subtitle={`${data.nasabah_aktif_30_hari} aktif 30 hari terakhir`}
        icon={<Users className="size-6" aria-hidden />}
        bgClass="bg-gradient-to-br from-cyan-600 to-cyan-700"
        href="/customers"
      />
      <StatBlock
        title="Nilai Setoran Sampah"
        value={formatRupiah(data.total_nilai_setoran)}
        subtitle={`Total Sampah: ${formatWeightKg(data.total_sampah_kg)}`}
        icon={<DollarSign className="size-6" aria-hidden />}
        bgClass="bg-gradient-to-br from-emerald-600 to-emerald-700"
        href="/transactions"
      />
      <StatBlock
        title="Penjemputan Menunggu"
        value={data.penjemputan_menunggu.toLocaleString('id-ID')}
        subtitle="Perlu penanganan petugas"
        icon={<Truck className="size-6" aria-hidden />}
        bgClass="bg-gradient-to-br from-amber-500 to-amber-600"
        href="/pickups"
      />
      <StatBlock
        title="Pengaduan Terbuka"
        value={data.pengaduan_terbuka.toLocaleString('id-ID')}
        subtitle="Perlu tindak lanjut segera"
        icon={<MessageSquare className="size-6" aria-hidden />}
        bgClass="bg-gradient-to-br from-rose-600 to-rose-700"
        href="/complaints"
      />
    </div>
  )
}

// ─── Sub-Component: Deposit Chart View (Green Header Bar) ─────────

function DepositChartView({ bulan, tahun }: { bulan: number; tahun: number }) {
  const [viewMonth, setViewMonth] = useState(bulan)
  const [viewYear, setViewYear] = useState(tahun)

  const { data, error, isLoading } = useSWR(
    `/dashboard/deposit-chart/?bulan=${viewMonth}&tahun=${viewYear}`,
    (path) => api.get<DepositChart>(path),
    { revalidateOnFocus: false },
  )

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

  return (
    <Card>
      {/* Header bar matching reference green banner */}
      <CardHeader variant="emerald" className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex min-w-0 items-center gap-2 truncate text-base font-bold text-white">
          <BarChart3 className="size-5 shrink-0 text-white/90" aria-hidden />
          Grafik Setoran Sampah
        </CardTitle>
        <div className="flex shrink-0 items-center rounded-lg bg-black/20 p-0.5 text-white">
          <button
            type="button"
            onClick={prevMonth}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/20"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <span className="min-w-20 px-1 text-center text-xs font-semibold">
            {MONTHS[viewMonth - 1]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/20"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="h-64"><TableSkeleton rows={4} cols={1} /></div>
        ) : error ? (
          <ErrorMessage title="Gagal memuat grafik" message="Tidak dapat memuat data chart setoran." />
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Belum ada data setoran untuk bulan ini.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelFormatter={(label) => `Tanggal ${label} ${MONTHS[viewMonth - 1]} ${viewYear}`}
                  formatter={(value, name) => {
                    const v = Number(value)
                    if (name === 'nilai') return [formatRupiah(v), 'Nilai Setoran']
                    if (name === 'berat') return [formatWeightKg(v), 'Berat Sampah']
                    if (name === 'transaksi') return [v, 'Jumlah Transaksi']
                    return [v, name]
                  }}
                />
                <Bar dataKey="berat" name="berat" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Sub-Component: Waste Breakdown Donut Chart (Cyan Header Bar) ─

function StockDistributionChart() {
  const { data: inventory, isLoading } = useSWR(
    '/inventory/',
    (path) => api.get<{
      total_stok_kg: string
      total_estimasi_nilai: string
      kategori: { nama: string; stok_terkini_kg: string; estimasi_nilai: string }[]
    }>(path),
    { revalidateOnFocus: false },
  )

  const pieData = useMemo(() => {
    if (!inventory?.kategori) return []
    return inventory.kategori
      .map((cat) => ({
        name: cat.nama,
        value: parseFloat(cat.stok_terkini_kg),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({ ...item, color: donutColor(index) }))
  }, [inventory])

  return (
    <Card>
      {/* Header bar matching reference cyan/teal banner */}
      <CardHeader variant="cyan" className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
          <PieChartIcon className="size-5 text-white/90" aria-hidden />
          Distribusi Stok Sampah
        </CardTitle>
        <Link href="/warehouse">
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-white hover:bg-white/20">
            Detail Gudang
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="h-64"><TableSkeleton rows={4} cols={2} /></div>
        ) : pieData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Package className="size-8 text-muted-foreground/50" aria-hidden />
            <p>Belum ada stok sampah tercatat.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-around gap-4 py-2">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatWeightKg(val ? Number(val) : 0), 'Stok']}
                    contentStyle={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="max-h-48 min-w-0 flex-1 space-y-2 overflow-y-auto">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className="ml-2 shrink-0 font-semibold text-foreground">{formatWeightKg(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Sub-Component: Recent Activity ────────────────────────────────

function RecentActivity({
  items,
  isLoading,
  className,
}: {
  items: ActivityItem[]
  isLoading: boolean
  className?: string
}) {
  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader variant="default" className="flex flex-row items-center justify-between border-b border-border shrink-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <TrendingUp className="size-5 text-primary" aria-hidden />
          Aktivitas Terbaru
        </CardTitle>
        <Link href="/transactions">
          <Button type="button" variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            Lihat Semua
            <ArrowRight className="ml-1 size-3.5" aria-hidden />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-0">
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={6} cols={3} /></div>
        ) : items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Belum ada aktivitas transaksi.</p>
        ) : (
          <ul className="flex-1 divide-y divide-border">
            {items.slice(0, 10).map((item, idx) => {
              const Icon = ACTIVITY_ICONS[item.type] ?? TrendingUp
              const label = ACTIVITY_LABELS[item.type] ?? item.type
              return (
                <li key={`${item.type}-${item.id}-${idx}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted/50 transition-colors">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {label}
                      {item.nasabah && <span className="font-normal text-muted-foreground"> — {item.nasabah}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.nominal && `${formatRupiah(item.nominal)} `}
                      {item.estimasi_berat_kg && `(${formatWeightKg(item.estimasi_berat_kg)})`}
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
  return (
    <Card>
      <CardHeader variant="default" className="flex flex-row items-center justify-between border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <MessageSquare className="size-5 text-rose-600" aria-hidden />
          Pengaduan Terbuka
        </CardTitle>
        <Link href="/complaints">
          <Button type="button" variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            Lihat Semua
            <ArrowRight className="ml-1 size-3.5" aria-hidden />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={3} cols={2} /></div>
        ) : complaints.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Tidak ada pengaduan terbuka saat ini.</p>
        ) : (
          <ul className="divide-y divide-border">
            {complaints.map((c) => (
              <li key={c.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-muted/50 transition-colors">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                  <AlertTriangle className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {c.nasabah_nama ?? `Nasabah #${c.nasabah}`}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{c.keluhan}</p>
                </div>
                <Link href="/complaints" className="shrink-0">
                  <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
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

// ─── Sub-Component: Stock Summary Table ───────────────────────────

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
      <CardHeader variant="default" className="flex flex-row items-center justify-between border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Package className="size-5 text-primary" aria-hidden />
          Stok Sampah Terkini
        </CardTitle>
        <Link href="/warehouse">
          <Button type="button" variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            Lihat Stok
            <ArrowRight className="ml-1 size-3.5" aria-hidden />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={4} cols={2} /></div>
        ) : topCategories.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Belum ada data stok.</p>
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
                <span>Total estimasi nilai stok:</span>
                <span className="font-semibold text-foreground">{formatRupiah(inventory.total_estimasi_nilai)}</span>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Petugas Dashboard ───────────────────────────────────────────

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
        <WelcomeBanner userName={user.nama_lengkap} role="petugas" />
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
        <WelcomeBanner userName={user.nama_lengkap} role="petugas" />
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
      <WelcomeBanner userName={user.nama_lengkap} role="petugas" />

      {/* Overview Stat Blocks */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatBlock
          title="Penjemputan Hari Ini"
          value={String(overview?.jemput_ditugaskan_hari_ini ?? 0)}
          subtitle="Tugas penjemputan ditugaskan"
          icon={<Truck className="size-6" aria-hidden />}
          bgClass="bg-gradient-to-br from-cyan-600 to-cyan-700"
          href="/pickups"
        />
        <StatBlock
          title="Antrian Aktif"
          value={String(overview?.antrian_aktif ?? 0)}
          subtitle="Tugas yang belum selesai"
          icon={<Users className="size-6" aria-hidden />}
          bgClass="bg-gradient-to-br from-amber-500 to-amber-600"
          href="/pickups"
        />
      </div>

      {/* Task list */}
      <Card>
        <CardHeader variant="emerald" className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
            <Truck className="size-5 text-white/90" aria-hidden />
            Tugas Penjemputan Saya
          </CardTitle>
          <Link href="/pickups">
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-white hover:bg-white/20">
              Lihat Semua
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {tasksLoading ? (
            <div className="p-4"><TableSkeleton rows={4} cols={3} /></div>
          ) : taskList.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Tidak ada penjemputan yang ditugaskan saat ini.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {taskList.map((task) => (
                <li key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted/50 transition-colors">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Truck className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {task.nasabah_nama ?? `Nasabah #${task.nasabah}`}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{task.alamat_jemput}</p>
                    <p className="text-xs text-muted-foreground font-medium">
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

function AdminDashboardContent({ userName, role }: { userName: string; role?: string }) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const { data: overview, error: overviewError, isLoading: overviewLoading, mutate: mutateOverview } = useSWR(
    '/dashboard/overview/',
    (path) => api.get<DashboardOverview>(path),
    { revalidateOnFocus: true },
  )

  const { data: activity, isLoading: activityLoading } = useSWR(
    '/dashboard/recent-activity/?limit=10',
    (path) => api.get<ActivityItem[]>(path),
    { revalidateOnFocus: true },
  )

  const { data: complaints, isLoading: complaintsLoading } = useSWR(
    '/complaints/?status=terbuka&page_size=5',
    (path) => api.get<Complaint[]>(path),
    { revalidateOnFocus: true },
  )

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <WelcomeBanner userName={userName} role={role} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-24 animate-pulse rounded-lg bg-surface-muted" /></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
        </div>
      </div>
    )
  }

  if (overviewError) {
    return (
      <div className="space-y-6">
        <WelcomeBanner userName={userName} role={role} />
        <ErrorMessage title="Gagal memuat data dashboard" message="Tidak dapat memuat ringkasan dashboard." onRetry={() => mutateOverview()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner Card (Matching reference design top placement) */}
      <WelcomeBanner userName={userName} role={role} />
      {/* Top Header section with Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan data operasional dan performa Bank Sampah MIRU.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/transactions/add">
            <Button type="button" size="sm" className="gap-1.5 font-semibold">
              <Plus className="size-4" aria-hidden />
              Input Setoran
            </Button>
          </Link>
          <Link href="/customers/add">
            <Button type="button" variant="outline" size="sm" className="gap-1.5 font-semibold">
              <UserPlus className="size-4" aria-hidden />
              Tambah Nasabah
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Blocks Grid (Matching reference design top) */}
      {overview && <OverviewStatCards data={overview} />}

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DepositChartView bulan={currentMonth} tahun={currentYear} />
        </div>
        <div>
          <StockDistributionChart />
        </div>
      </div>

      {/* Data Grids Row */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <div className="flex flex-col lg:col-span-2">
          <RecentActivity items={activity ?? []} isLoading={activityLoading} className="h-full" />
        </div>
        <div className="flex flex-col justify-between space-y-6">
          <OpenComplaints
            complaints={complaints ?? []}
            isLoading={complaintsLoading}
          />
          <StockMiniSummary />
        </div>
      </div>
    </div>
  )
}

// ─── Main Export Component ─────────────────────────────────────────

export function DashboardClient() {
  const { user } = useAuth()
  const userName = user?.nama_lengkap ?? 'User'

  if (user?.role === 'petugas' && user.id) {
    return <PetugasDashboard user={{ id: user.id, nama_lengkap: userName }} />
  }

  return <AdminDashboardContent userName={userName} role={user?.role} />
}
