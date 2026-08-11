'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { formatDateWIT, formatRupiah, formatWeightKg } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import Link from 'next/link'
import {
  AlertTriangle,
  Archive,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  BarChart3,
  Building2,
  FileText,
  History,
  Package,
  Scale,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────

interface InventoryItem {
  kategori_id: number
  nama: string
  harga_beli_per_kg: string
  stok_terkini_kg: string
  estimasi_nilai: string
}

interface InventorySummary {
  total_stok_kg: string
  total_estimasi_nilai: string
  kategori: InventoryItem[]
}

interface StockHistoryEntry {
  id: number
  tanggal: string
  arah: 'masuk' | 'keluar'
  berat_kg: string
  sumber: string
  referensi_id: number
}

interface StockHistoryData {
  kategori_id: number
  nama: string
  stok_terkini_kg: string
  history: StockHistoryEntry[]
}

// ─── Constants ────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD_KG = 10
const CRITICAL_STOCK_THRESHOLD_KG = 2

// ─── Helpers ──────────────────────────────────────────────────────

function getStockVariant(stokKg: number): 'success' | 'warning' | 'danger' {
  if (stokKg <= CRITICAL_STOCK_THRESHOLD_KG) return 'danger'
  if (stokKg < LOW_STOCK_THRESHOLD_KG) return 'warning'
  return 'success'
}

function getStockLabel(stokKg: number): string {
  if (stokKg === 0) return 'Habis'
  if (stokKg <= CRITICAL_STOCK_THRESHOLD_KG) return 'Kritis'
  if (stokKg < LOW_STOCK_THRESHOLD_KG) return 'Menipis'
  return 'Aman'
}

function getSumberLabel(sumber: string): string {
  const labels: Record<string, string> = {
    setoran: 'Setoran Nasabah',
    penjualan_mitra: 'Penjualan Mitra',
  }
  return labels[sumber] ?? sumber
}

// ─── Stock History Modal ──────────────────────────────────────────

function StockHistoryModal({
  kategoriId,
  kategoriName,
  open,
  onClose,
}: {
  kategoriId: number
  kategoriName: string
  open: boolean
  onClose: () => void
}) {
  const { data, error, isLoading, mutate } = useSWR(
    open ? `/inventory/${kategoriId}/history/` : null,
    (path) => api.get<StockHistoryData>(path),
    { revalidateOnFocus: false },
  )

  const history = data?.history ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Riwayat Stok: ${kategoriName}`}
      description={data ? `Stok terkini: ${formatWeightKg(data.stok_terkini_kg)}` : 'Mutasi stok masuk dan keluar.'}
      size="lg"
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      {isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : error ? (
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat riwayat stok." onRetry={() => mutate()} />
      ) : history.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Belum ada mutasi stok untuk kategori ini.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Berat</TableHead>
                <TableHead>Arah</TableHead>
                <TableHead>Sumber</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, idx) => (
                <TableRow key={`${entry.id}-${idx}`}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateWIT(entry.tanggal, { dateStyle: 'medium', timeStyle: 'short' })}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatWeightKg(entry.berat_kg)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.arah === 'masuk' ? 'success' : 'danger'}>
                      {entry.arah === 'masuk' ? (
                        <><ArrowDownToLine className="mr-1 inline size-3" aria-hidden /> Masuk</>
                      ) : (
                        <><ArrowUpFromLine className="mr-1 inline size-3" aria-hidden /> Keluar</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getSumberLabel(entry.sumber)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function WarehouseStock() {
  const {
    data: inventory,
    error,
    isLoading,
    mutate,
  } = useSWR('/inventory/', (path) => api.get<InventorySummary>(path), {
    revalidateOnFocus: true,
  })

  const list = inventory?.kategori ?? []

  // ── Stock history modal state ──
  const [stockHistoryTarget, setStockHistoryTarget] = useState<{ id: number; nama: string } | null>(null)

  // ── Derived from server data ──
  const totalStockKg = inventory ? parseFloat(inventory.total_stok_kg) : 0
  const totalValue = inventory ? parseFloat(inventory.total_estimasi_nilai) : 0
  const lowStockCount = list.filter((c) => {
    const kg = parseFloat(c.stok_terkini_kg)
    return kg < LOW_STOCK_THRESHOLD_KG
  }).length
  const outOfStockCount = list.filter((c) => parseFloat(c.stok_terkini_kg) === 0).length
  const totalKategori = list.length

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gudang & Stok</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ringkasan stok sampah per kategori.</p>
        </div>
        <TableSkeleton rows={8} cols={4} />
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gudang & Stok</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ringkasan stok sampah per kategori.</p>
        </div>
        <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat data stok gudang." onRetry={() => mutate()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gudang & Stok</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ringkasan stok sampah per kategori.</p>
        </div>
        <Button type="button" variant="ghost" onClick={() => mutate()} disabled={isLoading}>
          <FileText className="size-4" aria-hidden />
          Muat Ulang
        </Button>
      </div>

      {/* CTA ke Penjualan & Mitra (W8) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/warehouse/sales"
          className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ShoppingCart className="size-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Penjualan ke Mitra</p>
            <p className="text-xs text-muted-foreground">
              Catat penjualan sampah ke mitra/pengepul.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
        </Link>

        <Link
          href="/warehouse/partners"
          className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-warning/10">
            <Building2 className="size-5 text-warning" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Kelola Mitra Pengepul</p>
            <p className="text-xs text-muted-foreground">
              Tambah, ubah, atau hapus data mitra pengepul.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stok</CardTitle>
            <Scale className="size-4 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatWeightKg(totalStockKg)}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalKategori} kategori</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nilai Stok</CardTitle>
            <BarChart3 className="size-4 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatRupiah(totalValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total nilai ekonomi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stok Menipis</CardTitle>
            <TrendingDown className="size-4 text-warning" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Kategori dengan stok &lt; 10 kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stok Habis</CardTitle>
            <AlertTriangle className="size-4 text-danger" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-danger">{outOfStockCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Kategori dengan stok 0 kg</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Archive className="size-5 text-primary" aria-hidden />
            Stok per Kategori
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Stok Terkini</TableHead>
                <TableHead className="text-right">Harga Beli/kg</TableHead>
                <TableHead className="text-right">Nilai Stok</TableHead>
                <TableHead>Indikator</TableHead>
                <TableHead className="text-right">Riwayat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableEmpty colSpan={6} message="Belum ada data stok." />
              ) : (
                list.map((item) => {
                  const stokKg = parseFloat(item.stok_terkini_kg)
                  const variant = getStockVariant(stokKg)

                  return (
                    <TableRow key={item.kategori_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                            <Package className="size-4 text-muted-foreground" aria-hidden />
                          </div>
                          <span className="font-medium text-foreground">{item.nama}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatWeightKg(item.stok_terkini_kg)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatRupiah(item.harga_beli_per_kg)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatRupiah(item.estimasi_nilai)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>
                          {variant === 'danger' && <AlertTriangle className="mr-1 inline size-3" aria-hidden />}
                          {variant === 'warning' && <TrendingDown className="mr-1 inline size-3" aria-hidden />}
                          {variant === 'success' && <TrendingUp className="mr-1 inline size-3" aria-hidden />}
                          {getStockLabel(stokKg)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStockHistoryTarget({ id: item.kategori_id, nama: item.nama })}
                          >
                            <History className="size-4" aria-hidden />
                            Riwayat Stok
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Stock History Modal */}
      {stockHistoryTarget && (
        <StockHistoryModal
          kategoriId={stockHistoryTarget.id}
          kategoriName={stockHistoryTarget.nama}
          open={stockHistoryTarget !== null}
          onClose={() => setStockHistoryTarget(null)}
        />
      )}
    </div>
  )
}
