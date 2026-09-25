'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight, MapPinned } from 'lucide-react'
import { api } from '@/lib/api'
import {
  formatQuotaWeek,
  quotaWeek,
  todayWIT,
  type WilayahKuota,
} from '@/lib/pickup-quota'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

function quotaVariant(w: WilayahKuota) {
  if (!w.aktif) return 'default' as const
  if (w.sisa === 0) return 'danger' as const
  if (w.terpakai > 0) return 'warning' as const
  return 'success' as const
}

/**
 * Pemakaian kuota jemput 2×/minggu per wilayah (Senin–Minggu WIT).
 * Nasabah ditolak backend saat mengajukan jemput di minggu yang penuh.
 */
export function PickupQuotaCard() {
  const [offset, setOffset] = useState(0)
  const week = quotaWeek(todayWIT(), offset)

  const { data, error, isLoading } = useSWR(
    ['/wilayah/kuota/', week.start],
    ([path, tanggal]) => api.get<WilayahKuota[]>(path, { tanggal, page_size: '100' }),
    { revalidateOnFocus: true },
  )

  const wilayah = (data ?? []).filter((w) => w.aktif || w.terpakai > 0)
  const penuh = wilayah.filter((w) => w.aktif && w.sisa === 0).length

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <MapPinned className="mt-0.5 size-4 text-primary" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Kuota Jemput per Wilayah</h2>
            <p className="text-xs text-muted-foreground">
              Maksimal {data?.[0]?.maks ?? 2}× per minggu per wilayah. Pengajuan baru di wilayah
              yang penuh otomatis ditolak.
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
        </div>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="flex flex-wrap gap-2" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-7 w-32 animate-pulse rounded-full bg-surface-muted" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-danger" role="alert">
            Gagal memuat kuota wilayah. Coba muat ulang halaman.
          </p>
        ) : wilayah.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada wilayah layanan aktif.</p>
        ) : (
          <>
            <ul className="flex flex-wrap gap-2">
              {wilayah.map((w) => (
                <li key={w.id}>
                  <Badge variant={quotaVariant(w)}>
                    {w.kelurahan}
                    {w.rt ? ` RT ${w.rt}` : ''}
                    {w.rw ? ` RW ${w.rw}` : ''}: {w.terpakai}/{w.maks}
                    {!w.aktif ? ' (nonaktif)' : w.sisa === 0 ? ' · penuh' : ''}
                  </Badge>
                </li>
              ))}
            </ul>
            {penuh > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {penuh} wilayah sudah penuh.
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
