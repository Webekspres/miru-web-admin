/** Jadwal jemput per wilayah: maks 2 hari per minggu Senin–Minggu WIT (sama dengan backend). */

export const MAX_JADWAL_PER_MINGGU = 2

export interface JadwalJemput {
  id: number
  wilayah: number
  wilayah_nama: string
  /** YYYY-MM-DD */
  tanggal: string
  /** HH:MM:SS */
  jam_mulai: string
  jam_selesai: string
  catatan: string
  jumlah_pesanan: number
  bisa_dipesan: boolean
}

export interface QuotaWeek {
  /** YYYY-MM-DD hari Senin — dipakai sebagai `?tanggal=`. */
  start: string
  /** YYYY-MM-DD hari Minggu. */
  end: string
}

/** Tanggal hari ini (YYYY-MM-DD) di zona WIT. */
export function todayWIT(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jayapura' }).format(now)
}

export function shiftDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Minggu yang memuat `ymd`, digeser `offsetWeeks` minggu. */
export function quotaWeek(ymd: string, offsetWeeks = 0): QuotaWeek {
  const weekday = (new Date(`${ymd}T00:00:00Z`).getUTCDay() + 6) % 7 // Senin = 0
  const start = shiftDays(ymd, offsetWeeks * 7 - weekday)
  return { start, end: shiftDays(start, 6) }
}

/** Label singkat, contoh: "21–27 Sep 2026". */
export function formatQuotaWeek({ start, end }: QuotaWeek): string {
  const fmt = (ymd: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', ...opts }).format(new Date(`${ymd}T00:00:00Z`))
  const sameMonth = start.slice(0, 7) === end.slice(0, 7)
  const from = sameMonth ? fmt(start, { day: 'numeric' }) : fmt(start, { day: 'numeric', month: 'short' })
  return `${from}–${fmt(end, { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/** "Sel, 29 Sep" dari YYYY-MM-DD. */
export function formatJadwalTanggal(ymd: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${ymd}T00:00:00Z`))
}

/** "08.00–12.00" dari HH:MM(:SS). */
export function formatJamRange(mulai: string, selesai: string): string {
  const hm = (t: string) => t.slice(0, 5).replace(':', '.')
  return `${hm(mulai)}–${hm(selesai)}`
}
