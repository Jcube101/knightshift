import { describe, expect, it } from 'vitest'
import { mergeReviewCandidates, selectLatestSettings } from './conflicts'

const first = { moveNumber: 1, moveIndex: 0, played: 'e4', best: 'e5', loss: 90 }
const second = { moveNumber: 2, moveIndex: 2, played: 'Nf3', best: 'Nc3', loss: 120 }

describe('sync conflict rules', () => {
  it('merges review candidates with different stable move indices', () => {
    expect(mergeReviewCandidates('game-1', [second], [first])).toEqual([first, second])
  })

  it('deduplicates identical review candidates at the same move index', () => {
    expect(mergeReviewCandidates('game-1', [first], [{ ...first }])).toEqual([first])
  })

  it('surfaces conflicting review evidence at the same move index', () => {
    expect(() => mergeReviewCandidates('game-1', [first], [{ ...first, best: 'd4' }]))
      .toThrow('Review candidate conflict at game-1:0.')
  })

  it('prefers the latest explicit settings revision', () => {
    const earlier = { revision: 2, updatedAt: '2026-09-02T10:00:00.000Z', side: 'w' as const, difficulty: 'Steady' as const }
    const later = { revision: 3, updatedAt: '2026-09-02T09:00:00.000Z', side: 'b' as const, difficulty: 'Sharp' as const }

    expect(selectLatestSettings(earlier, later)).toEqual(later)
  })

  it('uses the server timestamp only when settings revisions tie', () => {
    const earlier = { revision: 3, updatedAt: '2026-09-02T10:00:00.000Z', side: 'w' as const, difficulty: 'Steady' as const }
    const later = { revision: 3, updatedAt: '2026-09-02T11:00:00.000Z', side: 'b' as const, difficulty: 'Sharp' as const }

    expect(selectLatestSettings(earlier, later)).toEqual(later)
  })
})
