import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { openingFamilies, openings, openingsForStudy, replaySan, studyPrompt } from './openings'

describe('curated opening catalogue', () => {
  it('covers the four survey families with thirteen major openings', () => {
    expect(openingFamilies).toEqual(['Open games', 'Semi-open defences', 'Queen’s pawn and Indian structures', 'Flank openings'])
    expect(openings).toHaveLength(13)
    expect(new Set(openings.map(opening => opening.id)).size).toBe(13)
    expect(openings.map(opening => opening.id)).toContain('scandinavian-defense')
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

  it('organises Black study by White’s first move and identifies the learner’s next reply', () => {
    const blackOpenings = openingsForStudy('b')
    expect(blackOpenings.map(opening => opening.id)).toContain('sicilian-defense')
    expect(blackOpenings.map(opening => opening.id)).not.toContain('italian-game')

    const sicilian = blackOpenings.find(opening => opening.id === 'sicilian-defense')!
    expect(studyPrompt(sicilian.variations[0], 1, 'b')).toEqual({ actor: 'You', move: 'c5', label: 'Your response to 1. e4' })
  })
})
