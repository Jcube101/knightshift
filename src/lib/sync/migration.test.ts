// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { saveDefaults } from '../defaults'
import { loadActiveGame, saveActiveGame, saveCompletedGame } from '../storage'
import { saveReviewJob } from '../reviewJob'
import { loadSyncOutbox } from './outbox'
import { migrateLocalStudyForSync } from './migration'

beforeEach(() => localStorage.clear())

describe('first-sync migration', () => {
  it('queues existing completed study data once without touching the active game', () => {
    saveCompletedGame({ id: 'saved-game', playedAt: '2026-09-03T08:00:00.000Z', result: '1-0', moves: ['e4'], playerColor: 'w', difficulty: 'Steady' })
    saveReviewJob({ gameId: 'saved-game', totalPlayerMoves: 1, nextMoveIndex: 2, candidates: [{ moveNumber: 1, moveIndex: 0, played: 'e4', best: 'e5', loss: 90 }], status: 'complete' })
    saveDefaults({ side: 'b', difficulty: 'Sharp' })
    saveActiveGame({ game: { fen: 'start', history: ['d4'], uciHistory: ['d2d4'] }, playerColor: 'w', difficulty: 'Steady', lastCapture: null })
    localStorage.removeItem('knightshift.sync-outbox')

    expect(migrateLocalStudyForSync('user-1')).toEqual({ queued: 4 })
    expect(loadSyncOutbox().map(operation => operation.kind).toSorted()).toEqual(['completed-game', 'review-candidate', 'review-status', 'settings'])
    expect(loadActiveGame()).toEqual({ game: { fen: 'start', history: ['d4'], uciHistory: ['d2d4'] }, playerColor: 'w', difficulty: 'Steady', lastCapture: null })

    expect(migrateLocalStudyForSync('user-1')).toEqual({ queued: 0 })
    expect(loadSyncOutbox()).toHaveLength(4)
  })
})
