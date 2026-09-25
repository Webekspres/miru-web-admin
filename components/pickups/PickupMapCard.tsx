'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { Map as MapIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDateWIT, formatWeightKg } from '@/lib/format'
import { useAuth } from '@/providers/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ErrorMessage } from '@/components/feedback/ErrorMessage'
import { dalamAreaMimika, LokasiMap, type MapPoint } from '@/components/maps/LokasiMap'
import type { Pickup, PickupStatus } from '@/types/models'

type Filter = 'aktif' | 'menunggu'

const FILTERS: { key: Filter; label: string; status: PickupStatus[] }[] = [
  { key: 'aktif', label: 'Aktif', status: ['disetujui', 'dijadwalkan', 'dalam_perjalanan', 'dijemput'] },
  { key: 'menunggu', label: 'Menunggu persetujuan', status: ['menunggu'] },
]

const STATUS_STYLE: Partial<Record<PickupStatus, { label: string; color: string }>> = {
  menunggu: { label: 'Menunggu', color: '#d97706' },
  disetujui: { label: 'Disetujui', color: '#2563eb' },
  dijadwalkan: { label: 'Dijadwalkan', color: '#2563eb' },
  dalam_perjalanan: { label: 'Dalam perjalanan', color: '#7c3aed' },
  dijemput: { label: 'Dijemput', color: '#7c3aed' },
}

const LEGEND = [
  { label: 'Menunggu', color: '#d97706' },
  { label: 'Disetujui / dijadwalkan', color: '#2563eb' },
  { label: 'Dalam perjalanan / dijemput', color: '#7c3aed' },
]

export function pickupPoint(p: Pickup): MapPoint | null {
  const lat = Number(p.latitude)
  const lng = Number(p.longitude)
  if (p.latitude == null || p.longitude == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }
  const style = STATUS_STYLE[p.status]
  return {
    id: p.id,
    lat,
    lng,
    title: p.nasabah_nama ?? `Nasabah #${p.nasabah}`,
    lines: [
      p.alamat_jemput,
      p.catatan_lokasi ? `Patokan: ${p.catatan_lokasi}` : '',
      `${formatDateWIT(p.jadwal, { dateStyle: 'medium', timeStyle: 'short' })} · ${formatWeightKg(p.estimasi_berat)}`,
      `${style?.label ?? p.status}${p.petugas_nama ? ` · ${p.petugas_nama}` : ''}`,
    ].filter(Boolean),
    color: style?.color,
  }
}

/** Peta semua penjemputan aktif/menunggu — bantu petugas merencanakan rute. */
export function PickupMapCard() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<Filter>('aktif')
  const isPetugas = user?.role === 'petugas'
  const status = FILTERS.find((f) => f.key === filter)!.status

  const { data, error, isLoading, mutate } = useSWR(
    ['/pickups/', 'map', filter, isPetugas ? user?.id : null],
    ([path]) =>
      api.get<Pickup[]>(path as string, {
        status__in: status.join(','),
        ordering: 'jadwal',
        page_size: '100',
        ...(isPetugas && user?.id ? { petugas: String(user.id) } : {}),
      }),
    { revalidateOnFocus: false },
  )

  const pickups = useMemo(() => data ?? [], [data])
  const points = useMemo(
    () => pickups.map(pickupPoint).filter((p): p is MapPoint => p !== null),
    [pickups],
  )
  const tanpaTitik = pickups.length - points.length
  const luarArea = points.filter((p) => !dalamAreaMimika(p.lat, p.lng)).length

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="size-5 text-primary" aria-hidden />
          Peta Penjemputan
        </CardTitle>
        <div className="flex gap-1" role="group" aria-label="Filter peta">
          {FILTERS.filter((f) => !(isPetugas && f.key === 'menunggu')).map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <ErrorMessage
            title="Gagal memuat peta"
            message="Data penjemputan tidak dapat dimuat."
            onRetry={() => mutate()}
          />
        ) : isLoading ? (
          <div className="h-80 animate-pulse rounded-lg bg-surface-muted" />
        ) : (
          <LokasiMap points={points} height={360} />
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            {points.length} titik
            {tanpaTitik > 0 && ` · ${tanpaTitik} penjemputan tanpa titik lokasi (lihat alamat di tabel)`}
          </span>
          {luarArea > 0 && (
            <span className="font-medium text-danger">
              {luarArea} titik di luar area Mimika Baru — periksa alamatnya
            </span>
          )}
          {LEGEND.map((item) => (
            <span key={item.color} className="flex items-center gap-1">
              <span className="inline-block size-2.5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
