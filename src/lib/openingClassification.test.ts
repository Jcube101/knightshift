import { describe, expect, it } from 'vitest'
import { classifyOpening } from './openingClassification'

describe('classifyOpening', () => {
  it('returns the longest named line that directly matches saved SAN', () => {
    expect(classifyOpening(['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'])).toMatchObject({
      status: 'identified', opening: 'Sicilian Defense', variation: 'Najdorf Variation', matchedPly: 10, continuation: 'within-line',
    })
  })

  it('keeps the parent opening when a game leaves known theory', () => {
    expect(classifyOpening(['e4', 'c5', 'Nf3', 'd6', 'h4'])).toMatchObject({
      status: 'identified', opening: 'Sicilian Defense', matchedPly: 4, continuation: 'unclassified',
    })
  })

  it('does not fabricate an opening for empty or malformed history', () => {
    expect(classifyOpening([])).toEqual({ status: 'unidentified' })
    expect(classifyOpening(['e4', 'not-a-move'])).toEqual({ status: 'unidentified' })
  })
})
