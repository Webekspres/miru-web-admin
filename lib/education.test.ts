import { describe, expect, it } from 'vitest'
import { excerptMarkdown } from './education'

describe('excerptMarkdown', () => {
  it('strips markdown markers and truncates', () => {
    expect(excerptMarkdown('## Halo **dunia**', 20)).toBe('Halo dunia')
    expect(excerptMarkdown('A'.repeat(40), 10)).toBe('AAAAAAAAAA…')
  })
})
