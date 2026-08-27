// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { loadReviewJob, nextPlayerMoveIndex, saveReviewJob } from './reviewJob'

beforeEach(() => localStorage.clear())

describe('review jobs', () => {
  it('persists completed candidate work so review can resume after a reload', () => {
    saveReviewJob({ gameId: 'game-1', totalPlayerMoves: 30, nextMoveIndex: 8, candidates: [{ moveNumber: 1, moveIndex: 0, played: 'e4', best: 'e5', loss: 90 }], status: 'paused' })
    expect(loadReviewJob('game-1')).toMatchObject({ nextMoveIndex: 8, status: 'paused', candidates: [{ played: 'e4' }] })
  })

  it('resumes from the first incomplete player ply', () => {
    expect(nextPlayerMoveIndex({ gameId: 'g', totalPlayerMoves: 3, nextMoveIndex: 2, candidates: [], status: 'paused' }, 'w')).toBe(4)
  })
})
