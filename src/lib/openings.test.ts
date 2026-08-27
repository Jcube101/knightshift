import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { openingFamilies, openings, replaySan } from './openings'

describe('curated opening catalogue', () => {
  it('covers the four survey families with twelve major openings', () => {
    expect(openingFamilies).toEqual(['Open games', 'Semi-open defences', 'Queen’s pawn and Indian structures', 'Flank openings'])
    expect(openings).toHaveLength(12)
    expect(new Set(openings.map(opening => opening.id)).size).toBe(12)
  })

  it('gives every opening a named, legal variation', () => {
    for (const opening of openings) {
      expect(opening.eco).toMatch(/^[A-E]\d\d$/)
      expect(opening.variations.length).toBeGreaterThan(0)
      for (const variation of opening.variations) {
        expect(variation.name).not.toHaveLength(0)
        expect(replaySan(variation.san)).toBeInstanceOf(Chess)
      }
    }
  })
})
