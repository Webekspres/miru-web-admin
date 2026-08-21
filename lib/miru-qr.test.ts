import { describe, expect, it } from 'vitest'
import { parseMiruNasabahQr } from '@/lib/miru-qr'

describe('parseMiruNasabahQr', () => {
  it('parses bare numeric id', () => {
    expect(parseMiruNasabahQr('42')).toEqual({ id: 42 })
    expect(parseMiruNasabahQr('  7  ')).toEqual({ id: 7 })
  })

  it('parses mobile JSON QR payload', () => {
    const raw = JSON.stringify({
      id: 15,
      nama_lengkap: 'Budi Santoso',
      no_hp: '08123456789',
    })
    expect(parseMiruNasabahQr(raw)).toEqual({
      id: 15,
      nama_lengkap: 'Budi Santoso',
      no_hp: '08123456789',
    })
  })

  it('accepts string id inside JSON', () => {
    expect(parseMiruNasabahQr('{"id":"9","nama_lengkap":"A"}')).toEqual({
      id: 9,
      nama_lengkap: 'A',
      no_hp: undefined,
    })
  })

  it('rejects invalid values', () => {
    expect(parseMiruNasabahQr('')).toBeNull()
    expect(parseMiruNasabahQr('0')).toBeNull()
    expect(parseMiruNasabahQr('-1')).toBeNull()
    expect(parseMiruNasabahQr('abc')).toBeNull()
    expect(parseMiruNasabahQr('{"nama_lengkap":"X"}')).toBeNull()
  })
})
