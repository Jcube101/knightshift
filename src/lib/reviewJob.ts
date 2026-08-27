import type { CandidateMoment } from './analysis'

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

export function loadReviewJob(gameId: string): ReviewJob | null { return jobs().find(job => job.gameId === gameId) ?? null }
export function saveReviewJob(job: ReviewJob): void { localStorage.setItem(reviewJobsKey, JSON.stringify([job, ...jobs().filter(saved => saved.gameId !== job.gameId)])) }

export function nextPlayerMoveIndex(job: ReviewJob, playerColor: 'w' | 'b'): number {
  return Math.max(playerColor === 'w' ? 0 : 1, job.nextMoveIndex + 2)
}
