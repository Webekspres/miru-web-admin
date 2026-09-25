/** Minggu kuota jemput: Senin–Minggu kalender WIT (sama dengan backend). */

export interface WilayahKuota {
  id: number
  kelurahan: string
  rt: string
  rw: string
  aktif: boolean
  terpakai: number
  maks: number
  sisa: number
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

function shiftDays(ymd: string, days: number): string {
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
