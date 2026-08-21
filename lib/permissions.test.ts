import { describe, expect, it } from 'vitest'
import { canMutate, isReadOnlyRole } from '@/lib/permissions'

describe('permissions', () => {
  it('marks koordinator and pemerintah as read-only', () => {
    expect(isReadOnlyRole('koordinator')).toBe(true)
    expect(isReadOnlyRole('pemerintah')).toBe(true)
    expect(isReadOnlyRole('admin')).toBe(false)
    expect(isReadOnlyRole('petugas')).toBe(false)
  })

  it('allows mutation for admin and petugas', () => {
    expect(canMutate('admin')).toBe(true)
    expect(canMutate('petugas')).toBe(true)
    expect(canMutate('koordinator')).toBe(false)
  })
})
