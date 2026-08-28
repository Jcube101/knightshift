// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { loadReviewJob, normalizeReviewJob, saveReviewJob } from './reviewJob'

beforeEach(() => localStorage.clear())

describe('review jobs', () => {
  it('persists completed candidate work so review can resume after a reload', () => {
    saveReviewJob({ gameId: 'game-1', totalPlayerMoves: 30, nextMoveIndex: 8, candidates: [{ moveNumber: 1, moveIndex: 0, played: 'e4', best: 'e5', loss: 90 }], status: 'paused' })
    expect(loadReviewJob('game-1')).toMatchObject({ nextMoveIndex: 8, status: 'paused', candidates: [{ played: 'e4' }] })
  })

  it('deduplicates interrupted review candidates and resumes at the first missing player ply', () => {
    const duplicated = [{ moveNumber: 1, moveIndex: 0, played: 'e4', best: 'e5', loss: 90 }, { moveNumber: 1, moveIndex: 0, played: 'e4', best: 'e5', loss: 90 }]
    expect(normalizeReviewJob({ gameId: 'g', totalPlayerMoves: 2, nextMoveIndex: 0, candidates: duplicated, status: 'failed' }, 'w')).toMatchObject({ nextMoveIndex: 2, candidates: [duplicated[0]] })
  })
})
