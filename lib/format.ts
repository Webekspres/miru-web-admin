const WIT_TIMEZONE = 'Asia/Jayapura'

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const weightFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function toNumber(value: string | number): number {
  return typeof value === 'string' ? parseFloat(value) : value
}

/** Format nilai ke Rupiah, contoh: `Rp125.000,00` */
export function formatRupiah(value: string | number): string {
  return rupiahFormatter
    .format(toNumber(value))
    .replace(/^Rp[\u00a0\s]/, 'Rp')
}

/** Format tanggal ISO ke locale Indonesia di timezone WIT (UTC+9). */
export function formatDateWIT(
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  },
): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: WIT_TIMEZONE,
    ...options,
  }).format(new Date(iso))
}

/** Format berat kilogram, contoh: `5,50 kg` */
export function formatWeightKg(value: string | number): string {
  return `${weightFormatter.format(toNumber(value))} kg`
}

/** Nama bulan dalam Bahasa Indonesia (0-indexed: Januari = 0). */
export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const

/** Default threshold for "low stock" label (kg). */
export const LOW_STOCK_THRESHOLD_KG = 10

/**
 * Label stok berdasarkan berat:
 * - 0 → 'Habis'
 * - ≤ criticalThreshold → 'Kritis' (hanya jika criticalThreshold diberikan)
 * - < lowThreshold → 'Menipis'
 * - sisanya → defaultLabel ('Aman' atau 'Tersedia')
 */
export function getStockLabel(
  stokKg: number,
  opts: {
    lowThreshold?: number
    criticalThreshold?: number
    defaultLabel?: string
  } = {},
): string {
  const low = opts.lowThreshold ?? LOW_STOCK_THRESHOLD_KG
  const critical = opts.criticalThreshold
  const label = opts.defaultLabel ?? 'Tersedia'

  if (stokKg === 0) return 'Habis'
  if (critical != null && stokKg <= critical) return 'Kritis'
  if (stokKg < low) return 'Menipis'
  return label
}
