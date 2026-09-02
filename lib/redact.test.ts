import { describe, expect, it } from 'vitest'
import { redactLogValue, redactSecrets } from '@/lib/redact'
import { GENERIC_USER_ERROR, toUserFacingErrorMessage } from '@/lib/safe-error'
import { ApiError } from '@/types/api'

describe('redactSecrets', () => {
  it('strips JWT, bearer, and password values', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.signaturexx'
    expect(redactSecrets(`token ${jwt}`)).toContain('[redacted]')
    expect(redactSecrets('Authorization: Bearer abc.def.ghi')).toContain('[redacted]')
    expect(redactSecrets('{"password":"rahasia"}')).toBe('{"password":"[redacted]"}')
  })

  it('redacts Error messages for logs', () => {
    expect(redactLogValue(new Error('Bearer super-secret'))).toContain('[redacted]')
  })
})

describe('toUserFacingErrorMessage', () => {
  it('keeps envelope messages', () => {
    expect(toUserFacingErrorMessage(new ApiError('Saldo tidak cukup.', 400))).toBe(
      'Saldo tidak cukup.',
    )
  })

  it('hides stack traces and generic Error', () => {
    const err = new Error('TypeError: cannot read of undefined\n    at foo (app.tsx:12)')
    expect(toUserFacingErrorMessage(err)).toBe(GENERIC_USER_ERROR)
  })
})
