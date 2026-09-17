import { describe, expect, it } from 'vitest'
import { contrastRatio, WCAG_AA_NORMAL } from '@/lib/contrast'
import { THEME } from '@/lib/theme'

describe('green theme contrast (WCAG AA)', () => {
  it('white text on primary green meets 4.5:1', () => {
    expect(contrastRatio(THEME.primaryForeground, THEME.primary)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL,
    )
  })

  it('body text on white meets 4.5:1', () => {
    expect(contrastRatio(THEME.foreground, THEME.background)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL,
    )
    expect(contrastRatio(THEME.mutedForeground, THEME.background)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL,
    )
  })

  it('danger and warning text on white meet 4.5:1', () => {
    expect(contrastRatio(THEME.danger, THEME.background)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
    expect(contrastRatio(THEME.warning, THEME.background)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
  })
})
