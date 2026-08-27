import { describe, expect, it } from 'vitest'
import { openingReflection } from './openingReflection'

const opening = { status: 'identified' as const, eco: 'B90', opening: 'Sicilian Defense', variation: 'Najdorf Variation', matchedPly: 10, continuation: 'unclassified' as const }
const moment = { rank: 1, moveNumber: 12, moveIndex: 22, played: 'a3', best: 'a4', loss: 120, label: 'Significant mistake' as const, explanation: 'This changed the balance of the position.' }

describe('openingReflection', () => {
  it('describes a first critical moment after a recognised line without assigning cause', () => {
    expect(openingReflection(opening, [moment])).toEqual({ kind: 'after-recognised-line', moveNumber: 12 })
  })

  it('keeps a game with no analysis separate from opening context', () => {
    expect(openingReflection(opening, undefined)).toEqual({ kind: 'not-analysed' })
  })
})
