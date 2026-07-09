import { describe, expect, it } from 'vitest'
import {
  NASABAH_LOGIN_MESSAGE,
  validateWebAdminRole,
  WebAdminAccessError,
} from '@/lib/auth'

describe('validateWebAdminRole', () => {
  it('allows web admin roles', () => {
    expect(validateWebAdminRole('admin')).toBe('admin')
    expect(validateWebAdminRole('petugas')).toBe('petugas')
    expect(validateWebAdminRole('koordinator')).toBe('koordinator')
    expect(validateWebAdminRole('pemerintah')).toBe('pemerintah')
  })

  it('blocks nasabah with mobile app message', () => {
    expect(() => validateWebAdminRole('nasabah')).toThrow(WebAdminAccessError)
    expect(() => validateWebAdminRole('nasabah')).toThrow(NASABAH_LOGIN_MESSAGE)
  })
})
