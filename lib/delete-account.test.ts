import { describe, expect, it } from 'vitest'
import {
  APP_DISPLAY_NAME,
  buildDeleteAccountWaUrl,
  buildDeleteRequestMessage,
  toWaMeNumber,
} from './delete-account'

describe('toWaMeNumber', () => {
  it('converts local 0… and spaced numbers to 62…', () => {
    expect(toWaMeNumber('0821 977 3693')).toBe('628219773693')
    expect(toWaMeNumber('628219773693')).toBe('628219773693')
  })
})

describe('buildDeleteAccountWaUrl', () => {
  it('builds wa.me URL with prefilled deletion request', () => {
    const url = buildDeleteAccountWaUrl('0821 977 3693', {
      nama: 'Budi',
      noHp: '081234567890',
      email: 'budi@example.com',
    })
    expect(url.startsWith('https://wa.me/628219773693?text=')).toBe(true)
    const text = decodeURIComponent(url.split('text=')[1] ?? '')
    expect(text).toContain(APP_DISPLAY_NAME)
    expect(text).toContain('Budi')
    expect(text).toContain('081234567890')
    expect(text).toContain('budi@example.com')
  })
})

describe('buildDeleteRequestMessage', () => {
  it('omits email line when empty', () => {
    const msg = buildDeleteRequestMessage({ nama: 'Ani', noHp: '0811' })
    expect(msg).not.toContain('Email:')
  })
})
