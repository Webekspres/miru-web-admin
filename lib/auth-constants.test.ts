import { describe, expect, it } from 'vitest'
import { PUBLIC_ROUTES } from './auth-constants'

describe('PUBLIC_ROUTES', () => {
  it('includes public education pages', () => {
    expect(PUBLIC_ROUTES).toContain('/edukasi')
  })
})
