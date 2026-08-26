/** Fallback selaras DEFAULT_INSTITUTION di backend (jika GET /api/settings/ gagal). */
export const FALLBACK_INSTITUTION = {
  nama_institusi: 'Bank Sampah MIRU - Distrik Mimika Baru',
  kontak: '0821 977 3693',
  email: 'distrikmiru@mimikakab.go.id',
} as const

export const APP_DISPLAY_NAME = 'MIRU Bank Sampah — Distrik Mimika Baru'

/** Normalisasi no. HP lokal ke format wa.me (62…). */
export function toWaMeNumber(kontak: string): string {
  const digits = kontak.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}

export function buildDeleteRequestMessage(input: {
  nama: string
  noHp: string
  email?: string
}): string {
  const lines = [
    `Permintaan Penghapusan Akun — ${APP_DISPLAY_NAME}`,
    '',
    `Nama: ${input.nama.trim()}`,
    `No. HP terdaftar: ${input.noHp.trim()}`,
  ]
  if (input.email?.trim()) {
    lines.push(`Email: ${input.email.trim()}`)
  }
  lines.push(
    '',
    'Saya meminta penghapusan akun MIRU saya sesuai kebijakan data pribadi.',
  )
  return lines.join('\n')
}

export function buildDeleteAccountWaUrl(
  kontak: string,
  input: { nama: string; noHp: string; email?: string },
): string {
  const phone = toWaMeNumber(kontak)
  const text = encodeURIComponent(buildDeleteRequestMessage(input))
  return `https://wa.me/${phone}?text=${text}`
}
