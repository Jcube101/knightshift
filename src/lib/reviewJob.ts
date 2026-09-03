import type { CandidateMoment } from './analysis'
import { reviewCandidateRecord } from './sync/records'
import { enqueueSyncOperation } from './sync/outbox'

export type ReviewJob = {
  gameId: string
  totalPlayerMoves: number
  nextMoveIndex: number
  candidates: CandidateMoment[]
  status: 'queued' | 'paused' | 'failed' | 'complete'
}

const reviewJobsKey = 'knightshift.review-jobs'

function jobs(): ReviewJob[] {
  try {
    const value = JSON.parse(localStorage.getItem(reviewJobsKey) ?? '[]')
    return Array.isArray(value) ? value as ReviewJob[] : []
  } catch { return [] }
}

export function loadReviewJobs(): ReviewJob[] { return jobs() }
export function replaceReviewJobsForSync(next: ReviewJob[]): void { localStorage.setItem(reviewJobsKey, JSON.stringify(next)) }
export function loadReviewJob(gameId: string): ReviewJob | null { return jobs().find(job => job.gameId === gameId) ?? null }
export function saveReviewJob(job: ReviewJob): void {
  localStorage.setItem(reviewJobsKey, JSON.stringify([job, ...jobs().filter(saved => saved.gameId !== job.gameId)]))

  for (const candidate of job.candidates) {
    if (candidate.moveIndex === undefined) continue
    const record = reviewCandidateRecord(job.gameId, candidate)
    enqueueSyncOperation({ id: `candidate:${record.syncKey}`, kind: 'review-candidate', payload: record, createdAt: new Date().toISOString() })
  }

  enqueueSyncOperation({
    id: `review-status:${job.gameId}`,
    kind: 'review-status',
    payload: {
      collection: 'knightshift_review_status',
      gameClientId: job.gameId,
      payloadVersion: 1,
      payload: { status: job.status, nextMoveIndex: job.nextMoveIndex, totalPlayerMoves: job.totalPlayerMoves },
    },
    createdAt: new Date().toISOString(),
  })
}
export function deleteReviewJob(gameId: string): void { localStorage.setItem(reviewJobsKey, JSON.stringify(jobs().filter(job => job.gameId !== gameId))) }

export function normalizeReviewJob(job: ReviewJob, playerColor: 'w' | 'b'): ReviewJob {
  const candidates = [...new Map(job.candidates.map(candidate => [candidate.moveIndex, candidate])).values()].toSorted((left, right) => (left.moveIndex ?? 0) - (right.moveIndex ?? 0))
  const first = playerColor === 'w' ? 0 : 1
  const nextMoveIndex = first + candidates.length * 2
  return { ...job, candidates, nextMoveIndex, status: job.status === 'complete' ? 'complete' : 'paused' }
}
