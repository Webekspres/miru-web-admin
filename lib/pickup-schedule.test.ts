import { describe, expect, it } from 'vitest'
import {
  formatJadwalTanggal,
  formatJamRange,
  formatQuotaWeek,
  quotaWeek,
  todayWIT,
} from './pickup-schedule'

describe('pickup schedule week', () => {
  it('uses Monday–Sunday', () => {
    expect(quotaWeek('2026-09-25')).toEqual({ start: '2026-09-21', end: '2026-09-27' })
    expect(quotaWeek('2026-09-27')).toEqual({ start: '2026-09-21', end: '2026-09-27' })
    expect(quotaWeek('2026-09-21')).toEqual({ start: '2026-09-21', end: '2026-09-27' })
  })

  it('shifts by weeks across months', () => {
    expect(quotaWeek('2026-09-25', 1)).toEqual({ start: '2026-09-28', end: '2026-10-04' })
    expect(quotaWeek('2026-09-25', -1)).toEqual({ start: '2026-09-14', end: '2026-09-20' })
  })

  it('today follows WIT, not UTC', () => {
    // 2026-09-27 16:00 UTC = 2026-09-28 01:00 WIT
    expect(todayWIT(new Date('2026-09-27T16:00:00Z'))).toBe('2026-09-28')
  })

  it('formats label', () => {
    expect(formatQuotaWeek({ start: '2026-09-21', end: '2026-09-27' })).toBe('21–27 Sep 2026')
    expect(formatQuotaWeek({ start: '2026-09-28', end: '2026-10-04' })).toBe('28 Sep–4 Okt 2026')
  })

  it('formats jadwal date and time range', () => {
    expect(formatJadwalTanggal('2026-09-29')).toBe('Sel, 29 Sep')
    expect(formatJamRange('08:00:00', '12:00:00')).toBe('08.00–12.00')
  })
})
