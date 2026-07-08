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
