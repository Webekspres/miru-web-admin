'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { CheckCircle2, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { MIN_BERAT_KG, parseBeratKg } from '@/lib/deposit'
import { formatRupiah, formatWeightKg } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { DetailRowInput, newDetailRow, type DetailRow } from '@/components/forms/DetailRowInput'
import type { Pickup, WasteCategory } from '@/types/models'

/**
 * Selesaikan penjemputan dengan hasil timbang (render dengan `key` per
 * penjemputan supaya form kosong setiap dibuka). Backend mencatatnya sebagai
 * setoran (saldo & poin nasabah bertambah) lalu menandai penjemputan selesai.
 */
export function SelesaikanPickupModal({
  pickup,
  onClose,
  onSubmit,
  loading,
}: {
  pickup: Pickup | null
  onClose: () => void
  onSubmit: (details: { kategori: number; berat_kg: number }[]) => void
  loading: boolean
}) {
  const [rows, setRows] = useState<DetailRow[]>(() => [newDetailRow()])
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({})
  const { data: categories = [] } = useSWR(
    pickup ? '/waste-categories/' : null,
    (path: string) => api.get<WasteCategory[]>(path),
    { revalidateOnFocus: false },
  )

  function update(id: string, field: keyof DetailRow, value: string | number) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
    setErrors((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const total = rows.reduce((sum, r) => sum + r.subtotal, 0)
  const totalBerat = rows.reduce((sum, r) => sum + parseBeratKg(r.berat_kg), 0)

  function handleSubmit() {
    const nextErrors: Record<string, Record<string, string>> = {}
    for (const r of rows) {
      const rowErr: Record<string, string> = {}
      if (r.kategori === '') rowErr.kategori = 'Pilih jenis sampah.'
      if (parseBeratKg(r.berat_kg) < MIN_BERAT_KG) rowErr.berat_kg = `Minimal ${MIN_BERAT_KG} kg.`
      if (Object.keys(rowErr).length) nextErrors[r.id] = rowErr
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSubmit(rows.map((r) => ({ kategori: Number(r.kategori), berat_kg: parseBeratKg(r.berat_kg) })))
  }

  return (
    <Modal
      open={pickup !== null}
      onClose={onClose}
      title="Selesaikan Penjemputan"
      description={
        pickup
          ? `Catat hasil timbang sampah ${pickup.nasabah_nama ?? 'nasabah'} (estimasi ${formatWeightKg(pickup.estimasi_berat)}). Nilainya langsung masuk ke saldo nasabah.`
          : undefined
      }
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="button" onClick={handleSubmit} loading={loading} disabled={loading}>
            <CheckCircle2 className="size-4" aria-hidden />
            Simpan & Selesaikan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <DetailRowInput
            key={row.id}
            row={row}
            categories={categories}
            onUpdate={update}
            onRemove={(id) => setRows((prev) => prev.filter((r) => r.id !== id))}
            canRemove={rows.length > 1}
            error={errors[row.id]}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setRows((prev) => [...prev, newDetailRow()])}
        >
          <Plus className="size-4" aria-hidden />
          Tambah jenis sampah
        </Button>
        <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Total {totalBerat > 0 ? formatWeightKg(totalBerat) : '—'}
          </span>
          <span className="font-semibold text-foreground">
            Masuk ke saldo: {total > 0 ? formatRupiah(total) : '—'}
          </span>
        </div>
      </div>
    </Modal>
  )
}
