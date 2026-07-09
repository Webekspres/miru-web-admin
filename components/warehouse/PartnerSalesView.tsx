'use client'

import { useMemo, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { api, getAccessToken, ApiError } from '@/lib/api'
import { API_PREFIX } from '@/lib/config'
import { formatDateWIT, formatRupiah, formatWeightKg } from '@/lib/format'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react'
import type { Partner, PartnerSale, WasteCategory } from '@/types/models'
import type { PaginationMeta } from '@/types/api'

// ─── Constants ────────────────────────────────────────────────────

type TabKey = 'input' | 'history'
const TABS: { key: TabKey; label: string }[] = [
  { key: 'input', label: 'Input Penjualan' },
  { key: 'history', label: 'Riwayat' },
]

// ─── Sales Input Sub-component ────────────────────────────────────

function SalesInput() {
  const { success: toastSuccess, error: toastError } = useToast()
  const { data: categories } = useSWR('/waste-categories/', (path) => api.get<WasteCategory[]>(path), { revalidateOnFocus: false })
  const { data: partners } = useSWR('/partners/', (path) => api.get<Partner[]>(path), { revalidateOnFocus: false })
  const { mutate: globalMutate } = useSWRConfig()

  const [mitraId, setMitraId] = useState('')
  const [kategoriId, setKategoriId] = useState('')
  const [beratJual, setBeratJual] = useState('')
  const [hargaJual, setHargaJual] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const catList = categories ?? []
  const partnerList = partners ?? []

  const selectedCategory = catList.find((c) => c.id === Number(kategoriId))
  const stokTerkini = selectedCategory ? parseFloat(selectedCategory.stok_terkini_kg) : 0
  const berat = parseFloat(beratJual) || 0
  const harga = parseFloat(hargaJual) || 0
  const total = berat * harga

  function validate() {
    const errs: Record<string, string> = {}
    if (!mitraId) errs.mitra = 'Pilih mitra.'
    if (!kategoriId) errs.kategori = 'Pilih kategori sampah.'
    if (!beratJual || berat < 1) errs.berat_jual_kg = 'Berat minimal 1 kg.'
    else if (berat > stokTerkini) errs.berat_jual_kg = `Stok tidak cukup (tersedia ${formatWeightKg(stokTerkini)}).`
    if (!hargaJual || harga <= 0) errs.harga_jual_per_kg = 'Harga jual harus lebih dari Rp0.'
    setFormErrors(errs); return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    try {
      await api.post('/partner-sales/', {
        mitra: Number(mitraId),
        kategori: Number(kategoriId),
        berat_jual_kg: berat,
        harga_jual_per_kg: harga,
      })
      toastSuccess('Penjualan berhasil dicatat.')
      setMitraId(''); setKategoriId(''); setBeratJual(''); setHargaJual(''); setFormErrors({})
      globalMutate((key) => {
        if (typeof key === 'string') return key.startsWith('/partner-sales/')
        if (Array.isArray(key)) return key[0] === '/partner-sales/'
        return false
      })
    } catch (err) {
      if (err instanceof ApiError) {
        const errs: Record<string, string> = {}
        if (err.errors) for (const [f, msgs] of Object.entries(err.errors)) errs[f] = msgs.join(', ')
        else errs._general = err.message
        setFormErrors(errs)
        toastError(err.message || 'Gagal mencatat penjualan.')
      }
    } finally { setSubmitting(false) }
  }

  const mitraOptions = partnerList.map((p) => ({ value: String(p.id), label: p.nama }))
  const catOptions = catList.map((c) => ({ value: String(c.id), label: `${c.nama} (stok: ${formatWeightKg(c.stok_terkini_kg)})` }))

  return (
    <div className="max-w-xl space-y-4">
      {formErrors._general && <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{formErrors._general}</div>}

      <Select label="Mitra" placeholder="Pilih mitra..." options={mitraOptions} value={mitraId}
        onChange={(e) => { setMitraId(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.mitra; return n }) }} error={formErrors.mitra} />

      <Select label="Kategori Sampah" placeholder="Pilih kategori..." options={catOptions} value={kategoriId}
        onChange={(e) => { setKategoriId(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.kategori; return n }) }} error={formErrors.kategori} />

      {stokTerkini > 0 && (
        <div className="rounded-lg bg-surface-muted p-3 text-sm">
          <span className="text-muted-foreground">Stok tersedia: </span>
          <span className="font-semibold text-foreground">{formatWeightKg(stokTerkini)}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Berat Jual (kg)" type="number" min="1" placeholder="Contoh: 50"
          value={beratJual} onChange={(e) => { setBeratJual(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.berat_jual_kg; return n }) }}
          error={formErrors.berat_jual_kg} />
        <Input label="Harga Jual/kg (Rp)" type="number" min="1" step="100" placeholder="Contoh: 5000"
          value={hargaJual} onChange={(e) => { setHargaJual(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.harga_jual_per_kg; return n }) }}
          error={formErrors.harga_jual_per_kg} />
      </div>

      {total > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Total Penjualan</p>
          <p className="text-2xl font-bold text-primary">{formatRupiah(total)}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatWeightKg(berat)} × {formatRupiah(harga)}/kg</p>
        </div>
      )}

      <Button type="button" onClick={handleSubmit} loading={submitting} disabled={submitting || !mitraId || !kategoriId || !beratJual || !hargaJual}>
        <ShoppingCart className="size-4" aria-hidden />
        Catat Penjualan
      </Button>
    </div>
  )
}

// ─── Sales History Sub-component ──────────────────────────────────

function SalesHistory() {
  const [page, setPage] = useState(1)

  const params = useMemo(() => ({ page: String(page), page_size: '20', ordering: '-tanggal' }), [page])

  const { data: fetchResult, error, isLoading, mutate } = useSWR(
    ['/partner-sales/', params],
    async ([path, queryParams]: [string, Record<string, string>]) => {
      const url = new URL(`${API_PREFIX}${path}`)
      for (const [k, v] of Object.entries(queryParams)) url.searchParams.set(k, v)
      const token = getAccessToken()
      const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Language': 'id', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      const envelope = await res.json()
      return { items: (envelope.data ?? []) as PartnerSale[], pagination: envelope.meta?.pagination as PaginationMeta | undefined }
    },
    { revalidateOnFocus: true },
  )

  const items = fetchResult?.items ?? []
  const pagination = fetchResult?.pagination

  if (isLoading) return <TableSkeleton rows={5} cols={5} />
  if (error) return <ErrorMessage title="Gagal memuat data" message="Tidak dapat memuat riwayat penjualan." onRetry={() => mutate()} />

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Mitra</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Berat</TableHead>
            <TableHead className="text-right">Harga/kg</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? <TableEmpty colSpan={6} message="Belum ada penjualan." /> : (
            items.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="whitespace-nowrap">{formatDateWIT(s.tanggal, { dateStyle: 'medium' })}</TableCell>
                <TableCell><div className="flex items-center gap-2"><Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden /><span className="font-medium text-foreground">{s.mitra_nama ?? `#${s.mitra}`}</span></div></TableCell>
                <TableCell className="text-muted-foreground">{s.kategori_nama ?? `#${s.kategori}`}</TableCell>
                <TableCell className="text-right">{formatWeightKg(s.berat_jual_kg)}</TableCell>
                <TableCell className="text-right">{formatRupiah(s.harga_jual_per_kg)}</TableCell>
                <TableCell className="text-right font-semibold">{formatRupiah(s.total_penjualan)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm text-muted-foreground">Halaman {pagination.page} dari {pagination.total_pages} ({pagination.count} total)</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.previous} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="size-4" aria-hidden />Sebelumnya</Button>
            <Button variant="outline" size="sm" disabled={!pagination.next} onClick={() => setPage((p) => p + 1)}>Selanjutnya<ChevronRight className="size-4" aria-hidden /></Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function PartnerSalesView() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Penjualan Mitra</h1>
        <p className="mt-1 text-sm text-muted-foreground">Catat penjualan sampah ke mitra/pengepul.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-0">
          <div className="flex gap-1" role="tablist">
            {TABS.map((tab) => (
              <button key={tab.key} type="button" role="tab" aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'}`}
              >{tab.label}</button>
            ))}
          </div>
        </CardHeader>
        <div className="p-4">
          {activeTab === 'input' ? <SalesInput /> : <SalesHistory />}
        </div>
      </Card>
    </div>
  )
}
