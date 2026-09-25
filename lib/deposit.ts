/** Aturan bisnis setoran: berat minimum per jenis sampah. */
export const MIN_BERAT_KG = 1

export function parseBeratKg(value: string | number): number {
  const num = typeof value === 'string' ? Number.parseFloat(value.replace(',', '.')) : value
  return Number.isFinite(num) ? num : 0
}

export function calculateSubtotal(hargaPerKg: number, beratKg: number): number {
  if (hargaPerKg <= 0 || beratKg <= 0) return 0
  return hargaPerKg * beratKg
}

export function isBeratMemenuhiMinimum(beratKg: number): boolean {
  return beratKg >= MIN_BERAT_KG
}

export function beratErrorMessage(beratKg: string | number): string | null {
  const parsed = parseBeratKg(beratKg)
  if (!beratKg && beratKg !== 0) return `Minimal ${MIN_BERAT_KG} kg.`
  if (parsed < MIN_BERAT_KG) return `Minimal ${MIN_BERAT_KG} kg.`
  return null
}
