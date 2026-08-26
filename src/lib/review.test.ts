import { describe, expect, it } from 'vitest'
import { rankLabel } from './review'

describe('rankLabel', () => {
  it('uses concise Roman numerals for critical-moment ranks', () => {
    expect(rankLabel(1)).toBe('I')
    expect(rankLabel(2)).toBe('II')
    expect(rankLabel(3)).toBe('III')
  })
})
