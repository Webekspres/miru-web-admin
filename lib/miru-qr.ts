/** Payload encoded in MIRU nasabah QR (mobile profil). */
export interface MiruNasabahQrPayload {
  id: number
  nama_lengkap?: string
  no_hp?: string
}

/**
 * Parse raw QR / manual input into nasabah id.
 * Accepts bare numeric id or JSON `{ id, nama_lengkap, no_hp }` from mobile.
 */
export function parseMiruNasabahQr(raw: string): MiruNasabahQrPayload | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed)
    if (!Number.isSafeInteger(id) || id <= 0) return null
    return { id }
  }

  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>
      const id = coercePositiveInt(obj.id)
      if (id == null) return null
      return {
        id,
        nama_lengkap: typeof obj.nama_lengkap === 'string' ? obj.nama_lengkap : undefined,
        no_hp: typeof obj.no_hp === 'string' ? obj.no_hp : undefined,
      }
    }
  } catch {
    // fall through to loose id extraction
  }

  const match = trimmed.match(/["']?id["']?\s*[:=]\s*["']?(\d+)/i)
  if (match) {
    const id = Number(match[1])
    if (Number.isSafeInteger(id) && id > 0) return { id }
  }

  return null
}

function coercePositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) {
    return value
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const id = Number(value)
    if (Number.isSafeInteger(id) && id > 0) return id
  }
  return null
}
