import { describe, expect, it } from 'vitest'
import { formatDateWIT, formatRupiah, formatWeightKg } from '@/lib/format'

describe('formatRupiah', () => {
  it('formats decimal string as Indonesian Rupiah', () => {
    expect(formatRupiah('125000.00')).toBe('Rp125.000,00')
  })

  it('formats number values', () => {
    expect(formatRupiah(50000)).toBe('Rp50.000,00')
  })
})

describe('formatDateWIT', () => {
  it('formats ISO timestamp in WIT timezone', () => {
    const formatted = formatDateWIT('2026-07-07T14:30:00+09:00', {
      dateStyle: 'long',
      timeStyle: 'short',
    })

    expect(formatted).toContain('2026')
    expect(formatted).toContain('14.30')
  })
})

describe('formatWeightKg', () => {
  it('formats weight with kg suffix', () => {
    expect(formatWeightKg('5.50')).toBe('5,50 kg')
  })
})
