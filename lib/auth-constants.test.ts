import { describe, expect, it } from 'vitest'
import { PUBLIC_ROUTES } from './auth-constants'

describe('PUBLIC_ROUTES', () => {
  it('includes public education pages', () => {
    expect(PUBLIC_ROUTES).toContain('/edukasi')
  })

  it('includes public legal pages', () => {
    expect(PUBLIC_ROUTES).toContain('/privacy-policy')
    expect(PUBLIC_ROUTES).toContain('/terms')
    expect(PUBLIC_ROUTES).toContain('/hapus-akun')
    expect(PUBLIC_ROUTES).toContain('/tentang')
  })
})
