import { describe, expect, it } from 'vitest'
import {
  buildLoginUrl,
  isSessionExpiredReason,
  SESSION_EXPIRED_VALUE,
} from '@/lib/session'

describe('session expired URL', () => {
  it('adds reason=expired and from path', () => {
    expect(buildLoginUrl('/balance', true)).toBe(
      '/login?reason=expired&from=%2Fbalance',
    )
    expect(isSessionExpiredReason(SESSION_EXPIRED_VALUE)).toBe(true)
    expect(isSessionExpiredReason(null)).toBe(false)
  })

  it('ignores protocol-relative from values', () => {
    expect(buildLoginUrl('//evil.example', true)).toBe('/login?reason=expired')
  })
})
