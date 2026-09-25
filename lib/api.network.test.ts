import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import { ApiError } from '@/types/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('api network error handling', () => {
  it('maps raw "fetch failed" to a friendly ApiError', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('fetch failed'),
    )

    await expect(api.get('/waste-categories/')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'NETWORK_ERROR',
    })
  })

  it('maps abort/timeout to a timeout ApiError', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError'),
    )

    try {
      await api.post('/auth/login/', { username: 'a', password: 'b' }, { skipAuth: true })
      expect.unreachable('should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).code).toBe('TIMEOUT')
    }
  })
})
