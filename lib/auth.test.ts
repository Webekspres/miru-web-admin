import { describe, expect, it } from 'vitest'
import { ApiError } from '@/types/api'
import {
  extractThrottleWaitSeconds,
  LOGIN_INVALID_CREDENTIALS_MESSAGE,
  LOGIN_RATE_LIMIT_MESSAGE,
  LOGIN_USER_NOT_FOUND_MESSAGE,
  LOGIN_WRONG_PASSWORD_MESSAGE,
  mapLoginError,
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

describe('mapLoginError', () => {
  it('maps English throttle message with remaining seconds', () => {
    const error = new ApiError(
      'Request was throttled. Expected available in 42 seconds.',
      429,
      'THROTTLED',
    )

    expect(mapLoginError(error)).toBe(
      'Terlalu banyak percobaan login. Coba lagi dalam 42 detik.',
    )
    expect(extractThrottleWaitSeconds(error)).toBe(42)
  })

  it('maps rate limit without seconds to friendly fallback', () => {
    const error = new ApiError(
      'Request was throttled.',
      429,
      'RATE_LIMIT_EXCEEDED',
    )

    expect(mapLoginError(error)).toBe(LOGIN_RATE_LIMIT_MESSAGE)
  })

  it('maps wait field from errors envelope', () => {
    const error = new ApiError('Permintaan dibatasi.', 429, 'THROTTLED', {
      wait: ['15'],
    })

    expect(mapLoginError(error)).toBe(
      'Terlalu banyak percobaan login. Coba lagi dalam 15 detik.',
    )
  })

  it('maps user-not-found code and message', () => {
    expect(
      mapLoginError(
        new ApiError('User not found', 401, 'USER_NOT_FOUND'),
      ),
    ).toBe(LOGIN_USER_NOT_FOUND_MESSAGE)

    expect(
      mapLoginError(
        new ApiError('Username tidak terdaftar.', 401, 'AUTHENTICATION_FAILED'),
      ),
    ).toBe(LOGIN_USER_NOT_FOUND_MESSAGE)
  })

  it('maps wrong-password code and message', () => {
    expect(
      mapLoginError(
        new ApiError('Password salah.', 401, 'INVALID_PASSWORD'),
      ),
    ).toBe(LOGIN_WRONG_PASSWORD_MESSAGE)
  })

  it('maps combined credentials failure to BI', () => {
    expect(
      mapLoginError(
        new ApiError(
          'Username atau password salah.',
          401,
          'AUTHENTICATION_FAILED',
        ),
      ),
    ).toBe(LOGIN_INVALID_CREDENTIALS_MESSAGE)

    expect(
      mapLoginError(
        new ApiError(
          'No active account found with the given credentials',
          401,
          'AUTHENTICATION_FAILED',
        ),
      ),
    ).toBe(LOGIN_INVALID_CREDENTIALS_MESSAGE)
  })
})
