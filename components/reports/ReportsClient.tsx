'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, ApiError } from '@/lib/api'
import { formatRupiah, formatWeightKg, MONTHS } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import * as XLSX from 'xlsx'
import { csvRow } from '@/lib/csv'
import {
  BarChart3,
  Calendar,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Scale,
  TrendingUp,
  Users,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────

interface Periode {
  mulai: string
  selesai: string
}

interface TonaseItem {
  nama: string
  total_berat_kg: string
  total_nilai: string
}

interface DailyReport {
  tanggal: string
  jumlah_transaksi: number
  total_setoran: string
  total_penarikan: string
  total_sampah_kg: string
  tonase_per_jenis: TonaseItem[]
}

interface WeeklyReport {
  minggu: number
  tahun: number
  periode: Periode
  jumlah_transaksi: number
  total_setoran: string
  total_penarikan: string
  total_sampah_kg: string
  nasabah_baru: number
  tonase_per_jenis: TonaseItem[]
}

interface MonthlyReport {
  bulan: number
  tahun: number
  periode: Periode
  jumlah_nasabah_terdaftar: number
  jumlah_nasabah_aktif: number
  jumlah_transaksi: number
  total_sampah_kg: string
  total_nilai_setoran: string
  total_penarikan: string
  total_saldo_beredar: string
  jumlah_reward_ditukar: number
  tonase_per_jenis: TonaseItem[]
}

interface EvaluationReport {
  periode: Periode
  jumlah_nasabah_terdaftar: number
  jumlah_nasabah_aktif: number
  nasabah_baru: number
  jumlah_transaksi: number
  total_sampah_kg: string
  total_nilai_setoran: string
  total_penarikan: string
  jumlah_reward_ditukar: number
  total_poin_ditukar: number
  wilayah_teraktif: { kelurahan: string; jumlah_nasabah_aktif: number }[]
  kendala: { total_pengaduan: number; per_jenis: { jenis: string; label: string; jumlah: number }[] }
  rekomendasi: string[]
  tonase_per_jenis: TonaseItem[]
}

interface WasteReport {
  periode: Periode
  total_berat_kg: string
  total_nilai: string
  per_kategori: TonaseItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────



type TabKey = 'daily' | 'weekly' | 'monthly' | 'waste' | 'evaluation'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'daily', label: 'Harian', icon: Calendar },
  { key: 'weekly', label: 'Mingguan', icon: BarChart3 },
  { key: 'monthly', label: 'Bulanan', icon: TrendingUp },
  { key: 'waste', label: 'Tonase per Kategori', icon: Scale },
  { key: 'evaluation', label: 'Evaluasi', icon: ClipboardCheck },
]

/** Tanggal lokal YYYY-MM-DD (bukan toISOString, yang bergeser ke hari sebelumnya di zona +7/+9). */
function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayISO(): string {
  return localISO(new Date())
}

function getCurrentWeek(): number {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - startOfYear.getTime()
  return Math.ceil(((diff / 86400000) + startOfYear.getDay() + 1) / 7)
}

/** Download a string as a file */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

/** Export data to Excel (.xlsx) and trigger download */
function exportExcel(data: Record<string, unknown>[], columns: { key: string; label: string }[], filename: string) {
  const header = columns.map((c) => c.label)
  const rows = data.map((row) => columns.map((c) => row[c.key] ?? ''))
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan')
  XLSX.writeFile(wb, filename)
}

/** Convert array of objects to CSV string */
function toCsv(data: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  return [
    csvRow(columns.map((c) => c.label)),
    ...data.map((row) => csvRow(columns.map((c) => row[c.key]))),
  ].join('\n')
}

// ─── Sub-Component: Summary Cards ──────────────────────────────────

function SummaryCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

// ─── Sub-Component: Tonase Table ──────────────────────────────────

function TonaseTable({ items }: { items: TonaseItem[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Total Berat</TableHead>
            <TableHead className="text-right">Total Nilai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableEmpty colSpan={3} message="Belum ada data untuk periode ini." />
          ) : (
            items.map((item, idx) => (
              <TableRow key={`${item.nama}-${idx}`}>
                <TableCell className="font-medium text-foreground">{item.nama}</TableCell>
                <TableCell className="text-right">{formatWeightKg(item.total_berat_kg)}</TableCell>
                <TableCell className="text-right font-semibold">{formatRupiah(item.total_nilai)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Daily Report ─────────────────────────────────────────────────

function DailyReportView() {
  const [tanggal, setTanggal] = useState(todayISO())

  const { data, error, isLoading, mutate } = useSWR(
    `/reports/daily/?tanggal=${tanggal}`,
    (path) => api.get<DailyReport>(path),
    { revalidateOnFocus: false },
  )

  function prevDay() {
    const d = new Date(tanggal)
    d.setDate(d.getDate() - 1)
    setTanggal(d.toISOString().split('T')[0])
  }

  function nextDay() {
    const d = new Date(tanggal)
    d.setDate(d.getDate() + 1)
    setTanggal(d.toISOString().split('T')[0])
  }

  function exportCsv() {
    if (!data) return
    const rows = [
      { label: 'Jumlah Transaksi', value: data.jumlah_transaksi },
      { label: 'Total Sampah (kg)', value: data.total_sampah_kg },
      { label: 'Nilai Setoran', value: data.total_setoran },
      { label: 'Nilai Penarikan', value: data.total_penarikan },
    ]
    const csv = toCsv(rows, [{ key: 'label', label: 'Metrik' }, { key: 'value', label: 'Nilai' }])
    downloadFile(csv, `laporan-harian-${tanggal}.csv`, 'text/csv')
  }

  function exportExcelDaily() {
    if (!data) return
    const rows = [
      { label: 'Jumlah Transaksi', value: data.jumlah_transaksi },
      { label: 'Total Sampah (kg)', value: data.total_sampah_kg },
      { label: 'Nilai Setoran', value: data.total_setoran },
      { label: 'Nilai Penarikan', value: data.total_penarikan },
    ]
    exportExcel(rows, [{ key: 'label', label: 'Metrik' }, { key: 'value', label: 'Nilai' }], `laporan-harian-${tanggal}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={prevDay} aria-label="Hari sebelumnya" className="px-1">
            <ChevronLeft className="size-4" />
          </Button>
          <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-44" />
          <Button type="button" variant="ghost" size="sm" onClick={nextDay} aria-label="Hari berikutnya" className="px-1">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => mutate()} disabled={isLoading}>
            <FileText className="size-4" aria-hidden /> Muat Ulang
          </Button>
          {data && (
            <>
              <Button type="button" variant="outline" onClick={exportCsv}>
                <Download className="size-4" aria-hidden /> CSV
              </Button>
              <Button type="button" variant="outline" onClick={exportExcelDaily}>
                <FileSpreadsheet className="size-4" aria-hidden /> Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : error ? (
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat laporan harian." onRetry={() => mutate()} />
      ) : data ? (
        <div className="report-print-target space-y-6" data-print-title={`Laporan Harian — ${tanggal}`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard title="Transaksi" value={data.jumlah_transaksi.toLocaleString('id-ID')} subtitle="Jumlah setoran" icon={<BarChart3 className="size-5" />} />
            <SummaryCard title="Sampah Terkumpul" value={formatWeightKg(data.total_sampah_kg)} icon={<Scale className="size-5" />} />
            <SummaryCard title="Nilai Setoran" value={formatRupiah(data.total_setoran)} icon={<TrendingUp className="size-5" />} />
            <SummaryCard title="Penarikan" value={formatRupiah(data.total_penarikan)} icon={<Users className="size-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tonase per Jenis Sampah</CardTitle>
            </CardHeader>
            <TonaseTable items={data.tonase_per_jenis} />
          </Card>
        </div>
      ) : null}
    </div>
  )
}

// ─── Weekly Report ────────────────────────────────────────────────

function WeeklyReportView() {
  const now = new Date()
  const [minggu, setMinggu] = useState(getCurrentWeek())
  const [tahun, setTahun] = useState(now.getFullYear())

  const { data, error, isLoading, mutate } = useSWR(
    `/reports/weekly/?minggu=${minggu}&tahun=${tahun}`,
    (path) => api.get<WeeklyReport>(path),
    { revalidateOnFocus: false },
  )

  function prevWeek() {
    if (minggu === 1) { setMinggu(52); setTahun(tahun - 1) }
    else setMinggu(minggu - 1)
  }

  function nextWeek() {
    if (minggu === 52) { setMinggu(1); setTahun(tahun + 1) }
    else setMinggu(minggu + 1)
  }

  function exportCsv() {
    if (!data) return
    const rows = [
      { label: 'Minggu ke', value: `${data.minggu} (${data.tahun})` },
      { label: 'Periode', value: `${data.periode.mulai} s.d. ${data.periode.selesai}` },
      { label: 'Jumlah Transaksi', value: data.jumlah_transaksi },
      { label: 'Total Sampah (kg)', value: data.total_sampah_kg },
      { label: 'Nilai Setoran', value: data.total_setoran },
      { label: 'Nilai Penarikan', value: data.total_penarikan },
      { label: 'Nasabah Baru', value: data.nasabah_baru },
    ]
    const csv = toCsv(rows, [{ key: 'label', label: 'Metrik' }, { key: 'value', label: 'Nilai' }])
    downloadFile(csv, `laporan-mingguan-${minggu}-${tahun}.csv`, 'text/csv')
  }

  function exportExcelWeekly() {
    if (!data) return
    const rows = [
      { label: 'Minggu ke', value: `${data.minggu} (${data.tahun})` },
      { label: 'Periode', value: `${data.periode.mulai} s.d. ${data.periode.selesai}` },
      { label: 'Jumlah Transaksi', value: data.jumlah_transaksi },
      { label: 'Total Sampah (kg)', value: data.total_sampah_kg },
      { label: 'Nilai Setoran', value: data.total_setoran },
      { label: 'Nilai Penarikan', value: data.total_penarikan },
      { label: 'Nasabah Baru', value: data.nasabah_baru },
    ]
    exportExcel(rows, [{ key: 'label', label: 'Metrik' }, { key: 'value', label: 'Nilai' }], `laporan-mingguan-${minggu}-${tahun}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={prevWeek} aria-label="Minggu sebelumnya" className="px-1">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium text-foreground">
            Minggu ke-{minggu} ({tahun})
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={nextWeek} aria-label="Minggu berikutnya" className="px-1">
            <ChevronRight className="size-4" />
          </Button>
          {data?.periode && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {data.periode.mulai} — {data.periode.selesai}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => mutate()} disabled={isLoading}>
            <FileText className="size-4" aria-hidden /> Muat Ulang
          </Button>
          {data && (
            <>
              <Button type="button" variant="outline" onClick={exportCsv}>
                <Download className="size-4" aria-hidden /> CSV
              </Button>
              <Button type="button" variant="outline" onClick={exportExcelWeekly}>
                <FileSpreadsheet className="size-4" aria-hidden /> Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : error ? (
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat laporan mingguan." onRetry={() => mutate()} />
      ) : data ? (
        <div className="report-print-target space-y-6" data-print-title={`Laporan Mingguan — Minggu ${minggu} ${tahun}`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard title="Transaksi" value={data.jumlah_transaksi.toLocaleString('id-ID')} subtitle="Jumlah setoran" icon={<BarChart3 className="size-5" />} />
            <SummaryCard title="Sampah Terkumpul" value={formatWeightKg(data.total_sampah_kg)} subtitle="Total berat" icon={<Scale className="size-5" />} />
            <SummaryCard title="Nilai Setoran" value={formatRupiah(data.total_setoran)} icon={<TrendingUp className="size-5" />} />
            <SummaryCard title="Nasabah Baru" value={data.nasabah_baru.toLocaleString('id-ID')} icon={<Users className="size-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tonase per Jenis Sampah</CardTitle>
            </CardHeader>
            <TonaseTable items={data.tonase_per_jenis} />
          </Card>
        </div>
      ) : null}
    </div>
  )
}

// ─── Monthly Report ───────────────────────────────────────────────

function MonthlyReportView() {
  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth() + 1)
  const [tahun, setTahun] = useState(now.getFullYear())

  const { data, error, isLoading, mutate } = useSWR(
    `/reports/monthly/?bulan=${bulan}&tahun=${tahun}`,
    (path) => api.get<MonthlyReport>(path),
    { revalidateOnFocus: false },
  )

  function prevMonth() {
    if (bulan === 1) { setBulan(12); setTahun(tahun - 1) }
    else setBulan(bulan - 1)
  }

  function nextMonth() {
    if (bulan === 12) { setBulan(1); setTahun(tahun + 1) }
    else setBulan(bulan + 1)
  }

  function exportCsv() {
    if (!data) return
    const rows = [
      { label: 'Bulan', value: `${MONTHS[data.bulan - 1]} ${data.tahun}` },
      { label: 'Periode', value: `${data.periode.mulai} s.d. ${data.periode.selesai}` },
      { label: 'Nasabah Terdaftar', value: data.jumlah_nasabah_terdaftar },
      { label: 'Nasabah Aktif', value: data.jumlah_nasabah_aktif },
      { label: 'Jumlah Transaksi', value: data.jumlah_transaksi },
      { label: 'Total Sampah (kg)', value: data.total_sampah_kg },
      { label: 'Nilai Setoran', value: data.total_nilai_setoran },
      { label: 'Nilai Penarikan', value: data.total_penarikan },
      { label: 'Saldo Beredar', value: data.total_saldo_beredar },
      { label: 'Reward Ditukar', value: data.jumlah_reward_ditukar },
    ]
    const csv = toCsv(rows, [{ key: 'label', label: 'Metrik' }, { key: 'value', label: 'Nilai' }])
    downloadFile(csv, `laporan-bulanan-${bulan}-${tahun}.csv`, 'text/csv')
  }

  function exportExcelMonthly() {
    if (!data) return
    const rows = [
      { label: 'Bulan', value: `${MONTHS[data.bulan - 1]} ${data.tahun}` },
      { label: 'Periode', value: `${data.periode.mulai} s.d. ${data.periode.selesai}` },
      { label: 'Nasabah Terdaftar', value: data.jumlah_nasabah_terdaftar },
      { label: 'Nasabah Aktif', value: data.jumlah_nasabah_aktif },
      { label: 'Jumlah Transaksi', value: data.jumlah_transaksi },
      { label: 'Total Sampah (kg)', value: data.total_sampah_kg },
      { label: 'Nilai Setoran', value: data.total_nilai_setoran },
      { label: 'Nilai Penarikan', value: data.total_penarikan },
      { label: 'Saldo Beredar', value: data.total_saldo_beredar },
      { label: 'Reward Ditukar', value: data.jumlah_reward_ditukar },
    ]
    exportExcel(rows, [{ key: 'label', label: 'Metrik' }, { key: 'value', label: 'Nilai' }], `laporan-bulanan-${bulan}-${tahun}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={prevMonth} aria-label="Bulan sebelumnya" className="px-1">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium text-foreground">
            {MONTHS[bulan - 1]} {tahun}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={nextMonth} aria-label="Bulan berikutnya" className="px-1">
            <ChevronRight className="size-4" />
          </Button>
          {data?.periode && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {data.periode.mulai} — {data.periode.selesai}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => mutate()} disabled={isLoading}>
            <FileText className="size-4" aria-hidden /> Muat Ulang
          </Button>
          {data && (
            <>
              <Button type="button" variant="outline" onClick={exportCsv}>
                <Download className="size-4" aria-hidden /> CSV
              </Button>
              <Button type="button" variant="outline" onClick={exportExcelMonthly}>
                <FileSpreadsheet className="size-4" aria-hidden /> Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={3} />
      ) : error ? (
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat laporan bulanan." onRetry={() => mutate()} />
      ) : data ? (
        <div className="report-print-target space-y-6" data-print-title={`Laporan Bulanan — ${MONTHS[bulan - 1]} ${tahun}`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard title="Nasabah Terdaftar" value={data.jumlah_nasabah_terdaftar.toLocaleString('id-ID')} subtitle={`${data.jumlah_nasabah_aktif} aktif`} icon={<Users className="size-5" />} />
            <SummaryCard title="Transaksi" value={data.jumlah_transaksi.toLocaleString('id-ID')} icon={<BarChart3 className="size-5" />} />
            <SummaryCard title="Sampah Terkumpul" value={formatWeightKg(data.total_sampah_kg)} subtitle={`Nilai: ${formatRupiah(data.total_nilai_setoran)}`} icon={<Scale className="size-5" />} />
            <SummaryCard title="Reward Ditukar" value={data.jumlah_reward_ditukar.toLocaleString('id-ID')} icon={<TrendingUp className="size-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tonase per Jenis Sampah</CardTitle>
            </CardHeader>
            <TonaseTable items={data.tonase_per_jenis} />
          </Card>
        </div>
      ) : null}
    </div>
  )
}

// ─── Waste / Tonase per Kategori Report ───────────────────────────

function WasteReportView() {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [start, setStart] = useState(localISO(firstOfMonth))
  const [end, setEnd] = useState(todayISO())

  const { data, error, isLoading, mutate } = useSWR(
    `/reports/waste/?start=${start}&end=${end}`,
    (path) => api.get<WasteReport>(path),
    { revalidateOnFocus: false },
  )

  function exportCsv() {
    if (!data) return
    // Summary
    const summaryRows = [
      { label: 'Periode', value: `${data.periode.mulai} s.d. ${data.periode.selesai}` },
      { label: 'Total Berat (kg)', value: data.total_berat_kg },
      { label: 'Total Nilai', value: data.total_nilai },
    ]
    const summaryCsv = toCsv(summaryRows, [{ key: 'label', label: 'Metrik' }, { key: 'value', label: 'Nilai' }])

    // Per Kategori
    const catCsv = toCsv(
      data.per_kategori as unknown as Record<string, unknown>[],
      [
        { key: 'nama', label: 'Kategori' },
        { key: 'total_berat_kg', label: 'Total Berat (kg)' },
        { key: 'total_nilai', label: 'Total Nilai' },
      ],
    )

    downloadFile(summaryCsv + '\n\n--- Per Kategori ---\n' + catCsv, `laporan-tonase-${start}-${end}.csv`, 'text/csv')
  }

  function exportExcelWaste() {
    if (!data) return
    const summaryRows = [
      { label: 'Periode', value: `${data.periode.mulai} s.d. ${data.periode.selesai}` },
      { label: 'Total Berat (kg)', value: data.total_berat_kg },
      { label: 'Total Nilai', value: data.total_nilai },
    ] as Record<string, unknown>[]

    const catRows = data.per_kategori as unknown as Record<string, unknown>[]

    exportExcel(summaryRows, [{ key: 'label', label: 'Metrik' }, { key: 'value', label: 'Nilai' }], `laporan-tonase-ringkasan-${start}-${end}.xlsx`)
    exportExcel(catRows, [
      { key: 'nama', label: 'Kategori' },
      { key: 'total_berat_kg', label: 'Total Berat (kg)' },
      { key: 'total_nilai', label: 'Total Nilai' },
    ], `laporan-tonase-per-kategori-${start}-${end}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-40" label="Dari" />
          <span className="text-muted-foreground">—</span>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-40" label="Sampai" />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => mutate()} disabled={isLoading}>
            <FileText className="size-4" aria-hidden /> Muat Ulang
          </Button>
          {data && (
            <>
              <Button type="button" variant="outline" onClick={exportCsv}>
                <Download className="size-4" aria-hidden /> CSV
              </Button>
              <Button type="button" variant="outline" onClick={exportExcelWaste}>
                <FileSpreadsheet className="size-4" aria-hidden /> Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : error ? (
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat laporan tonase." onRetry={() => mutate()} />
      ) : data ? (
        <div className="report-print-target space-y-6" data-print-title={`Laporan Tonase — ${start} s.d. ${end}`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard title="Total Berat" value={formatWeightKg(data.total_berat_kg)} subtitle={data.per_kategori.length > 0 ? `${data.per_kategori.length} kategori` : undefined} icon={<Scale className="size-5" />} />
            <SummaryCard title="Total Nilai" value={formatRupiah(data.total_nilai)} icon={<TrendingUp className="size-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tonase per Kategori</CardTitle>
            </CardHeader>
            <TonaseTable items={data.per_kategori} />
          </Card>
        </div>
      ) : null}
    </div>
  )
}

// ─── Evaluation Report ────────────────────────────────────────────

function EvaluationReportView() {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [start, setStart] = useState(localISO(firstOfMonth))
  const [end, setEnd] = useState(todayISO())
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const { data, error, isLoading, mutate } = useSWR(
    `/reports/evaluation/?start=${start}&end=${end}`,
    (path) => api.get<EvaluationReport>(path),
    { revalidateOnFocus: false },
  )

  async function exportExcelServer() {
    setExporting(true)
    setExportError(null)
    try {
      await api.download('/reports/evaluation/export/', `laporan-evaluasi-${start}-${end}.xlsx`, { start, end })
    } catch (err) {
      setExportError(err instanceof ApiError ? err.message : 'Gagal mengekspor laporan evaluasi.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-40" label="Dari" />
          <span className="text-muted-foreground">—</span>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-40" label="Sampai" />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => mutate()} disabled={isLoading}>
            <FileText className="size-4" aria-hidden /> Muat Ulang
          </Button>
          {data && (
            <Button type="button" variant="outline" onClick={() => void exportExcelServer()} loading={exporting}>
              <FileSpreadsheet className="size-4" aria-hidden /> Excel
            </Button>
          )}
        </div>
      </div>
      {exportError && <p className="text-sm text-danger" role="alert">{exportError}</p>}

      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : error ? (
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat laporan evaluasi." onRetry={() => mutate()} />
      ) : data ? (
        <div className="report-print-target space-y-6" data-print-title={`Laporan Evaluasi — ${start} s.d. ${end}`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Nasabah Aktif"
              value={String(data.jumlah_nasabah_aktif)}
              subtitle={`dari ${data.jumlah_nasabah_terdaftar} terdaftar · ${data.nasabah_baru} baru`}
              icon={<Users className="size-5" />}
            />
            <SummaryCard
              title="Transaksi Setoran"
              value={String(data.jumlah_transaksi)}
              subtitle={formatWeightKg(data.total_sampah_kg)}
              icon={<Scale className="size-5" />}
            />
            <SummaryCard
              title="Nilai Setoran"
              value={formatRupiah(data.total_nilai_setoran)}
              subtitle={`Penarikan ${formatRupiah(data.total_penarikan)}`}
              icon={<TrendingUp className="size-5" />}
            />
            <SummaryCard
              title="Reward Ditukar"
              value={String(data.jumlah_reward_ditukar)}
              subtitle={`${data.total_poin_ditukar} poin`}
              icon={<BarChart3 className="size-5" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Wilayah Teraktif</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kelurahan / Kampung</TableHead>
                    <TableHead className="text-right">Nasabah Aktif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.wilayah_teraktif.length === 0 ? (
                    <TableEmpty colSpan={2} message="Belum ada setoran dari nasabah berkelurahan." />
                  ) : (
                    data.wilayah_teraktif.map((w) => (
                      <TableRow key={w.kelurahan}>
                        <TableCell className="font-medium text-foreground">{w.kelurahan}</TableCell>
                        <TableCell className="text-right">{w.jumlah_nasabah_aktif}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Kendala ({data.kendala.total_pengaduan} pengaduan)
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis Pengaduan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.kendala.per_jenis.length === 0 ? (
                    <TableEmpty colSpan={2} message="Tidak ada pengaduan pada periode ini." />
                  ) : (
                    data.kendala.per_jenis.map((k) => (
                      <TableRow key={k.jenis}>
                        <TableCell className="font-medium text-foreground">{k.label}</TableCell>
                        <TableCell className="text-right">{k.jumlah}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rekomendasi Tindak Lanjut</CardTitle>
            </CardHeader>
            <CardContent>
              {data.rekomendasi.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada tindak lanjut dari pengaduan yang ditutup pada periode ini.
                </p>
              ) : (
                <ol className="list-decimal space-y-1.5 pl-5 text-sm text-foreground">
                  {data.rekomendasi.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tonase per Jenis</CardTitle>
            </CardHeader>
            <TonaseTable items={data.tonase_per_jenis} />
          </Card>
        </div>
      ) : null}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function ReportsClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('daily')

  return (
    <div className="space-y-6">
      <div className="print-hidden flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Laporan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filter periode dan rekap data operasional bank sampah.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => window.print()} className="print-hidden">
          <Printer className="size-4" aria-hidden /> Cetak / Simpan PDF
        </Button>
      </div>

      {/* Tab Navigation */}
      <Card>
        <div className="print-hidden border-b border-border">
          <div className="flex gap-1 px-4" role="tablist">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-b-2 border-primary bg-background text-primary'
                      : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'daily' && <DailyReportView />}
          {activeTab === 'weekly' && <WeeklyReportView />}
          {activeTab === 'monthly' && <MonthlyReportView />}
          {activeTab === 'waste' && <WasteReportView />}
          {activeTab === 'evaluation' && <EvaluationReportView />}
        </div>
      </Card>
    </div>
  )
}
