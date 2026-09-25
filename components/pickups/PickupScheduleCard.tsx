'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { CalendarPlus, ChevronLeft, ChevronRight, MapPinned, X } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import {
  formatJadwalTanggal,
  formatJamRange,
  formatQuotaWeek,
  MAX_JADWAL_PER_MINGGU,
  quotaWeek,
  shiftDays,
  todayWIT,
  type JadwalJemput,
} from '@/lib/pickup-schedule'
import { useAuth } from '@/providers/AuthProvider'
import { useWilayah, wilayahLabel } from '@/hooks/useWilayah'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

interface AddForm {
  wilayah: string
  tanggal: string
  jam_mulai: string
  jam_selesai: string
  catatan: string
}

const EMPTY_FORM: AddForm = {
  wilayah: '',
  tanggal: '',
  jam_mulai: '08:00',
  jam_selesai: '12:00',
  catatan: '',
}

/**
 * Jadwal jemput per wilayah (maks 2 hari/minggu, hari bebas).
 * Membuat jadwal mengirim notifikasi ke nasabah di wilayah tersebut;
 * nasabah hanya bisa mengajukan jemput pada jadwal ini.
 */
export function PickupScheduleCard() {
  const { user } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const canManage = user?.role === 'admin' || user?.role === 'koordinator'

  const [offset, setOffset] = useState(0)
  const today = todayWIT()
  const week = quotaWeek(today, offset)

  const { wilayah, options: wilayahOptions, isLoading: wilayahLoading } = useWilayah()
  const { data, error, isLoading, mutate } = useSWR(
    ['/jadwal-jemput/', week.start],
    ([path, tanggal]) => api.get<JadwalJemput[]>(path, { tanggal }),
    { revalidateOnFocus: true },
  )

  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState<AddForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AddForm | '_general', string>>>({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const jadwal = data ?? []
  const byWilayah = new Map<number, JadwalJemput[]>()
  for (const j of jadwal) {
    byWilayah.set(j.wilayah, [...(byWilayah.get(j.wilayah) ?? []), j])
  }
  const rows = wilayah.filter((w) => w.aktif || byWilayah.has(w.id))
  const belumAdaJadwal = rows.filter((w) => w.aktif && !byWilayah.has(w.id)).length

  function openAdd(wilayahId?: number) {
    // Default: Senin minggu terpilih, tapi tidak lebih awal dari besok.
    const tomorrow = shiftDays(today, 1)
    setForm({
      ...EMPTY_FORM,
      wilayah: wilayahId ? String(wilayahId) : '',
      tanggal: week.start > tomorrow ? week.start : tomorrow,
    })
    setFormErrors({})
    setAddOpen(true)
  }

  async function handleAdd() {
    const errs: typeof formErrors = {}
    if (!form.wilayah) errs.wilayah = 'Pilih wilayah.'
    if (!form.tanggal) errs.tanggal = 'Pilih tanggal.'
    else if (form.tanggal <= today) errs.tanggal = 'Jadwal minimal untuk besok (warga memesan H-1).'
    if (form.jam_selesai <= form.jam_mulai) errs.jam_selesai = 'Jam selesai harus setelah jam mulai.'
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      await api.post('/jadwal-jemput/', {
        wilayah: Number(form.wilayah),
        tanggal: form.tanggal,
        jam_mulai: form.jam_mulai,
        jam_selesai: form.jam_selesai,
        catatan: form.catatan.trim(),
      })
      toastSuccess('Jadwal ditambahkan. Warga di wilayah ini sudah diberi notifikasi.')
      setAddOpen(false)
      // Tampilkan minggu dari jadwal yang baru dibuat.
      setOffset(weeksBetween(quotaWeek(today).start, quotaWeek(form.tanggal).start))
      await mutate()
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const next: typeof formErrors = {}
        for (const [field, messages] of Object.entries(err.errors)) {
          const msg = messages.join(', ')
          if (field in EMPTY_FORM) next[field as keyof AddForm] = msg
          else next._general = msg
        }
        setFormErrors(next)
      } else {
        toastError(err instanceof ApiError ? err.message : 'Gagal menambahkan jadwal. Coba lagi.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(j: JadwalJemput) {
    const label = `${j.wilayah_nama} ${formatJadwalTanggal(j.tanggal)}`
    if (!window.confirm(`Hapus jadwal jemput ${label}?`)) return
    setDeletingId(j.id)
    try {
      await api.delete(`/jadwal-jemput/${j.id}/`)
      toastSuccess('Jadwal jemput dihapus.')
      await mutate()
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Gagal menghapus jadwal. Coba lagi.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <MapPinned className="mt-0.5 size-4 text-primary" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Jadwal Jemput per Wilayah</h2>
            <p className="text-xs text-muted-foreground">
              Maksimal {MAX_JADWAL_PER_MINGGU} hari jemput per minggu per wilayah. Warga hanya bisa
              memesan pada jadwal ini (paling lambat H-1) dan diberi notifikasi saat jadwal dibuat.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Minggu sebelumnya"
            onClick={() => setOffset((o) => o - 1)}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="min-w-36 text-center text-sm font-medium text-foreground">
            {formatQuotaWeek(week)}
            {offset === 0 && (
              <span className="block text-xs font-normal text-muted-foreground">Minggu ini</span>
            )}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Minggu berikutnya"
            onClick={() => setOffset((o) => o + 1)}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
          {canManage && (
            <Button type="button" size="sm" onClick={() => openAdd()} className="ml-2 whitespace-nowrap">
              <CalendarPlus className="size-4" aria-hidden />
              Tambah Jadwal
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3">
        {isLoading || wilayahLoading ? (
          <div className="space-y-2" aria-hidden>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-surface-muted" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-danger" role="alert">
            Gagal memuat jadwal jemput. Coba muat ulang halaman.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada wilayah layanan aktif.</p>
        ) : (
          <>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {rows.map((w) => {
                const items = byWilayah.get(w.id) ?? []
                const full = items.length >= MAX_JADWAL_PER_MINGGU
                return (
                  <li
                    key={w.id}
                    className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {wilayahLabel(w)}
                      {!w.aktif && <span className="ml-1 text-xs text-muted-foreground">(nonaktif)</span>}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {items.length === 0 && (
                        <span className="text-xs text-warning">Belum ada jadwal</span>
                      )}
                      {items.map((j) => (
                        <span
                          key={j.id}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                          title={j.catatan || undefined}
                        >
                          {formatJadwalTanggal(j.tanggal)} · {formatJamRange(j.jam_mulai, j.jam_selesai)} ·{' '}
                          {j.jumlah_pesanan} pesanan
                          {canManage && j.jumlah_pesanan === 0 && j.bisa_dipesan && (
                            <button
                              type="button"
                              className="ml-0.5 cursor-pointer rounded-full p-0.5 hover:bg-primary/20 disabled:opacity-50"
                              aria-label={`Hapus jadwal ${w.kelurahan} ${formatJadwalTanggal(j.tanggal)}`}
                              disabled={deletingId === j.id}
                              onClick={() => handleDelete(j)}
                            >
                              <X className="size-3" aria-hidden />
                            </button>
                          )}
                        </span>
                      ))}
                      {canManage && w.aktif && !full && week.end > today && (
                        <button
                          type="button"
                          className="cursor-pointer text-xs font-medium text-primary hover:underline"
                          onClick={() => openAdd(w.id)}
                        >
                          + Jadwal
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
            {belumAdaJadwal > 0 && week.end > today && (
              <p className="mt-2 text-xs text-muted-foreground">
                {belumAdaJadwal} wilayah belum punya jadwal jemput pada minggu ini — warganya belum
                bisa mengajukan penjemputan.
              </p>
            )}
          </>
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        title="Tambah Jadwal Jemput"
        description="Warga aktif di wilayah terpilih akan menerima notifikasi jadwal ini."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="button" onClick={handleAdd} loading={saving} disabled={saving}>
              Simpan & Kirim Notifikasi
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formErrors._general && (
            <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger" role="alert">
              {formErrors._general}
            </div>
          )}
          <Select
            label="Wilayah"
            id="jadwal-wilayah"
            value={form.wilayah}
            onChange={(e) => setForm((f) => ({ ...f, wilayah: e.target.value }))}
            options={[
              { value: '', label: '— Pilih wilayah —' },
              ...wilayahOptions.filter((o) => wilayah.find((w) => String(w.id) === o.value)?.aktif),
            ]}
            error={formErrors.wilayah}
          />
          <Input
            label="Tanggal"
            type="date"
            min={shiftDays(today, 1)}
            value={form.tanggal}
            onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
            error={formErrors.tanggal}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Jam mulai (WIT)"
              type="time"
              value={form.jam_mulai}
              onChange={(e) => setForm((f) => ({ ...f, jam_mulai: e.target.value }))}
              error={formErrors.jam_mulai}
            />
            <Input
              label="Jam selesai (WIT)"
              type="time"
              value={form.jam_selesai}
              onChange={(e) => setForm((f) => ({ ...f, jam_selesai: e.target.value }))}
              error={formErrors.jam_selesai}
            />
          </div>
          <Input
            label="Catatan (opsional)"
            placeholder="Contoh: titik kumpul di depan balai kampung"
            value={form.catatan}
            onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
            error={formErrors.catatan}
          />
        </div>
      </Modal>
    </Card>
  )
}

function weeksBetween(fromMonday: string, toMonday: string): number {
  const ms = new Date(`${toMonday}T00:00:00Z`).getTime() - new Date(`${fromMonday}T00:00:00Z`).getTime()
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000))
}
