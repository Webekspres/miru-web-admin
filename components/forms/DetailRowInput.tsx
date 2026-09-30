'use client'

import { Trash2 } from 'lucide-react'
import { calculateSubtotal, parseBeratKg } from '@/lib/deposit'
import { formatRupiah } from '@/lib/format'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { WasteCategory } from '@/types/models'

/** Satu baris hasil timbang (jenis sampah + berat) — dipakai input setoran & penyelesaian penjemputan. */
export interface DetailRow {
  id: string
  kategori: number | ''
  kategori_nama: string
  berat_kg: string
  harga_per_kg: number
  subtotal: number
}

export const EMPTY_DETAIL_ROW: Omit<DetailRow, 'id'> = {
  kategori: '',
  kategori_nama: '',
  berat_kg: '',
  harga_per_kg: 0,
  subtotal: 0,
}

export function newDetailRow(): DetailRow {
  return { id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11), ...EMPTY_DETAIL_ROW }
}

function parseNumber(value: string | number): number {
  return parseBeratKg(value)
}

export function DetailRowInput({
  row,
  categories,
  onUpdate,
  onRemove,
  canRemove,
  error,
}: {
  row: DetailRow
  categories: WasteCategory[]
  onUpdate: (id: string, field: keyof DetailRow, value: string | number) => void
  onRemove: (id: string) => void
  canRemove: boolean
  error?: Record<string, string>
}) {
  const options = categories.map((cat) => ({
    value: String(cat.id),
    label: `${cat.nama} (${formatRupiah(cat.harga_beli_per_kg)}/kg)`,
  }))

  function handleKategoriChange(value: string) {
    const catId = value ? Number(value) : ''
    const cat = categories.find((c) => c.id === catId)
    const harga = cat ? parseNumber(cat.harga_beli_per_kg) : 0
    const berat = parseNumber(row.berat_kg)
    const subtotal = calculateSubtotal(harga, berat)

    onUpdate(row.id, 'kategori', catId)
    onUpdate(row.id, 'kategori_nama', cat?.nama ?? '')
    onUpdate(row.id, 'harga_per_kg', harga)
    onUpdate(row.id, 'subtotal', subtotal)
  }

  function handleBeratChange(value: string) {
    // Allow empty or valid decimal
    if (value !== '' && !/^\d*[.,]?\d*$/.test(value)) return

    const normalized = value.replace(',', '.')
    const berat = parseNumber(normalized)
    const harga = row.harga_per_kg
    const subtotal = calculateSubtotal(harga, berat)

    onUpdate(row.id, 'berat_kg', normalized)
    onUpdate(row.id, 'subtotal', subtotal)
  }

  const beratError = error?.berat_kg ?? error?.berat

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface-muted/20 p-3">
      {/* Kategori */}
      <div className="min-w-0 flex-1 basis-50">
        <Select
          label="Jenis Sampah"
          placeholder="Pilih kategori..."
          options={options}
          value={row.kategori !== '' ? String(row.kategori) : ''}
          onChange={(e) => handleKategoriChange(e.target.value)}
          error={error?.kategori}
        />
      </div>

      {/* Berat */}
      <div className="w-35 shrink-0">
        <Input
          label="Berat (kg)"
          type="text"
          inputMode="decimal"
          placeholder="Min 1 kg"
          value={row.berat_kg}
          onChange={(e) => handleBeratChange(e.target.value)}
          error={beratError}
        />
      </div>

      {/* Harga (read-only) */}
      <div className="w-32.5 shrink-0">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Harga/kg</span>
          <div className="flex h-11 items-center rounded-lg border border-border bg-surface-muted px-3 text-sm text-muted-foreground">
            {row.harga_per_kg > 0 ? formatRupiah(row.harga_per_kg) : '—'}
          </div>
        </div>
      </div>

      {/* Subtotal (read-only) */}
      <div className="w-32.5 shrink-0">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Subtotal</span>
          <div className="flex h-11 items-center rounded-lg border border-border bg-surface-muted px-3 text-sm font-semibold text-foreground">
            {row.subtotal > 0 ? formatRupiah(row.subtotal) : '—'}
          </div>
        </div>
      </div>

      {/* Hapus */}
      <div className="flex shrink-0 items-end pb-0.5">
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          disabled={!canRemove}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Hapus baris ${row.kategori_nama || ''}`.trim()}
          title="Hapus baris"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
