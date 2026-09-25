import useSWR from 'swr'
import { api } from '@/lib/api'
import type { SelectOption } from '@/components/ui/Select'
import type { User, WilayahLayanan } from '@/types/models'

export function wilayahLabel(w: WilayahLayanan): string {
  const parts = [w.kelurahan]
  if (w.rt) parts.push(`RT ${w.rt}`)
  if (w.rw) parts.push(`RW ${w.rw}`)
  return parts.join(' ')
}

/** Ringkasan domisili nasabah: "Kwamki · RT 01 / RW 02". */
export function formatWilayah(u: Pick<User, 'kelurahan_nama' | 'rt' | 'rw'>): string {
  const parts: string[] = []
  if (u.kelurahan_nama) parts.push(u.kelurahan_nama)
  if (u.rt || u.rw) parts.push(`RT ${u.rt || '—'} / RW ${u.rw || '—'}`)
  return parts.join(' · ') || 'Kelurahan belum diisi'
}

/** Daftar wilayah layanan (backend membatasi page_size maks 100). */
export function useWilayah() {
  const { data, error, isLoading } = useSWR(
    ['/wilayah/', 'all'],
    ([path]) => api.get<WilayahLayanan[]>(path, { page_size: '100' }),
    { revalidateOnFocus: false },
  )

  const wilayah = data ?? []
  const options: SelectOption[] = wilayah.map((w) => ({
    value: String(w.id),
    label: w.aktif ? wilayahLabel(w) : `${wilayahLabel(w)} (nonaktif)`,
  }))

  return { wilayah, options, error, isLoading }
}
