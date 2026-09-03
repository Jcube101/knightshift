import type { CandidateMoment } from '../analysis'
import type { ReviewJob } from '../reviewJob'

type RemoteStatus = { gameClientId: string; payload: { status: ReviewJob['status']; nextMoveIndex: number; totalPlayerMoves: number } }
type RemoteCandidate = { gameClientId: string; moveIndex: number; payload: CandidateMoment }

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).toSorted(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(',')}}`
  return JSON.stringify(value)
}

export function mergeReviewJobs(local: ReviewJob[], statuses: RemoteStatus[], candidates: RemoteCandidate[]): ReviewJob[] {
  const byGame = new Map(local.map(job => [job.gameId, { ...job, candidates: [...job.candidates] }]))
  for (const status of statuses) {
    const existing = byGame.get(status.gameClientId)
    if (existing) byGame.set(status.gameClientId, { ...existing, ...status.payload, candidates: existing.candidates })
    else byGame.set(status.gameClientId, { gameId: status.gameClientId, ...status.payload, candidates: [] })
  }
  for (const record of candidates) {
    const job = byGame.get(record.gameClientId)
    if (!job) continue
    const present = job.candidates.find(candidate => candidate.moveIndex === record.moveIndex)
    if (present && stable(present) !== stable(record.payload)) throw new Error(`Review candidate conflict at ${record.gameClientId}:${record.moveIndex}.`)
    if (!present) job.candidates.push(record.payload)
  }
  return [...byGame.values()].map(job => ({ ...job, candidates: job.candidates.toSorted((a, b) => (a.moveIndex ?? 0) - (b.moveIndex ?? 0)) }))
}
