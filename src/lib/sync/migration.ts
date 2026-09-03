import { readDefaults, readDefaultsRevision } from '../defaults'
import { loadReviewJobs } from '../reviewJob'
import { loadSavedGames } from '../storage'
import { reviewCandidateRecord, settingsRecord } from './records'
import { enqueueSyncOperation } from './outbox'

function migrationKey(owner: string): string { return `knightshift.sync-migration-v1:${owner}` }

export function migrateLocalStudyForSync(owner: string): { queued: number } {
  if (localStorage.getItem(migrationKey(owner)) === 'complete') return { queued: 0 }

  let queued = 0
  for (const game of loadSavedGames()) {
    enqueueSyncOperation({ id: `game:${game.id}`, kind: 'completed-game', payload: { collection: 'knightshift_games', clientId: game.id, playedAt: game.playedAt, payloadVersion: 1, payload: game }, createdAt: new Date().toISOString() })
    queued += 1
  }

  for (const job of loadReviewJobs()) {
    for (const candidate of job.candidates) {
      if (candidate.moveIndex === undefined) continue
      const record = reviewCandidateRecord(job.gameId, candidate)
      enqueueSyncOperation({ id: `candidate:${record.syncKey}`, kind: 'review-candidate', payload: record, createdAt: new Date().toISOString() })
      queued += 1
    }
    enqueueSyncOperation({ id: `review-status:${job.gameId}`, kind: 'review-status', payload: { collection: 'knightshift_review_status', gameClientId: job.gameId, payloadVersion: 1, payload: { status: job.status, nextMoveIndex: job.nextMoveIndex, totalPlayerMoves: job.totalPlayerMoves } }, createdAt: new Date().toISOString() })
    queued += 1
  }

  const defaults = readDefaults()
  const revision = Math.max(Date.now(), readDefaultsRevision() + 1)
  enqueueSyncOperation({ id: 'settings', kind: 'settings', payload: settingsRecord(defaults, revision), createdAt: new Date().toISOString() })
  queued += 1

  localStorage.setItem(migrationKey(owner), 'complete')
  return { queued }
}
