import { describe, expect, it } from 'vitest'
import { mergeReviewJobs } from './reviews'

describe('review sync merge', () => {
  it('unites review candidates from two devices by game and move index', () => {
    const merged = mergeReviewJobs(
      [{ gameId: 'game-1', totalPlayerMoves: 3, nextMoveIndex: 2, status: 'paused', candidates: [{ moveNumber: 1, moveIndex: 0, played: 'e4', best: 'e5', loss: 90 }] }],
      [{ gameClientId: 'game-1', payload: { status: 'paused', nextMoveIndex: 4, totalPlayerMoves: 3 } }],
      [{ gameClientId: 'game-1', moveIndex: 2, payload: { moveNumber: 2, moveIndex: 2, played: 'Nf3', best: 'Nc3', loss: 80 } }],
    )
    expect(merged).toEqual([{ gameId: 'game-1', totalPlayerMoves: 3, nextMoveIndex: 4, status: 'paused', candidates: [{ moveNumber: 1, moveIndex: 0, played: 'e4', best: 'e5', loss: 90 }, { moveNumber: 2, moveIndex: 2, played: 'Nf3', best: 'Nc3', loss: 80 }] }])
  })
})
