import { describe, expect, it } from 'vitest'
import { completedGameRecord, reviewCandidateRecord, settingsRecord } from './records'

describe('sync records', () => {
  it('creates an immutable completed-game record from the existing game id', () => {
    const record = completedGameRecord({
      id: 'game-1',
      playedAt: '2026-09-02T10:00:00.000Z',
      result: '1-0',
      moves: ['e4', 'e5'],
    })

    expect(record).toMatchObject({
      collection: 'knightshift_games',
      clientId: 'game-1',
      playedAt: '2026-09-02T10:00:00.000Z',
      payloadVersion: 1,
      payload: { id: 'game-1', result: '1-0' },
    })
  })

  it('uses a deterministic key for each review candidate', () => {
    const record = reviewCandidateRecord('game-1', {
      moveNumber: 8,
      moveIndex: 14,
      played: 'Nf3',
      best: 'Nc3',
      loss: 91,
    })

    expect(record).toMatchObject({
      collection: 'knightshift_review_candidates',
      gameClientId: 'game-1',
      moveIndex: 14,
      syncKey: 'game-1:14',
      payloadVersion: 1,
    })
  })

  it('rejects a review candidate without a stable move index', () => {
    expect(() => reviewCandidateRecord('game-1', { moveNumber: 8, played: 'Nf3', best: 'Nc3', loss: 91 }))
      .toThrow('Review candidates require a move index.')
  })

  it('creates a versioned mutable settings record', () => {
    expect(settingsRecord({ side: 'b', difficulty: 'Sharp' }, 3)).toEqual({
      collection: 'knightshift_settings',
      revision: 3,
      payloadVersion: 1,
      payload: { side: 'b', difficulty: 'Sharp' },
    })
  })

  it('never adapts an active checkpoint into a sync record', () => {
    expect(() => completedGameRecord({
      id: 'active-game',
      playedAt: '2026-09-02T10:00:00.000Z',
      result: '1-0',
      moves: [],
      activeGame: true,
    } as never)).toThrow('Active game checkpoints are device-local and cannot sync.')
  })
})
