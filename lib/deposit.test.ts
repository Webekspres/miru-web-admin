import { describe, expect, it } from 'vitest'
import {
  calculateSubtotal,
  isBeratMemenuhiMinimum,
  MIN_BERAT_KG,
  parseBeratKg,
} from '@/lib/deposit'

describe('deposit calculation', () => {
  it('uses 1 kg as the minimum weight', () => {
    expect(MIN_BERAT_KG).toBe(1)
    expect(isBeratMemenuhiMinimum(1)).toBe(true)
    expect(isBeratMemenuhiMinimum(0.99)).toBe(false)
    expect(isBeratMemenuhiMinimum(0)).toBe(false)
  })

  it('parses comma decimals', () => {
    expect(parseBeratKg('2,5')).toBe(2.5)
    expect(parseBeratKg('')).toBe(0)
  })

  it('auto-calculates subtotal from harga and berat', () => {
    expect(calculateSubtotal(2000, 1.5)).toBe(3000)
    expect(calculateSubtotal(1500, 2)).toBe(3000)
    expect(calculateSubtotal(2000, 0)).toBe(0)
    expect(calculateSubtotal(0, 3)).toBe(0)
  })
})
