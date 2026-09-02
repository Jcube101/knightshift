import type { CandidateMoment } from '../analysis'
import type { Defaults } from '../defaults'

export type VersionedSettings = Defaults & { revision: number; updatedAt: string }

function stableCandidate(candidate: CandidateMoment): string {
  return JSON.stringify(Object.fromEntries(Object.entries(candidate).toSorted(([left], [right]) => left.localeCompare(right))))
}

export function mergeReviewCandidates(gameId: string, local: CandidateMoment[], remote: CandidateMoment[]): CandidateMoment[] {
  const merged = new Map<number, CandidateMoment>()

  for (const candidate of [...local, ...remote]) {
    if (candidate.moveIndex === undefined) throw new Error(`Review candidate conflict at ${gameId}:missing-index.`)

    const existing = merged.get(candidate.moveIndex)
    if (existing && stableCandidate(existing) !== stableCandidate(candidate)) {
      throw new Error(`Review candidate conflict at ${gameId}:${candidate.moveIndex}.`)
    }
    merged.set(candidate.moveIndex, existing ?? candidate)
  }

  return [...merged.values()].toSorted((left, right) => (left.moveIndex ?? 0) - (right.moveIndex ?? 0))
}

export function selectLatestSettings(left: VersionedSettings, right: VersionedSettings): VersionedSettings {
  if (left.revision !== right.revision) return left.revision > right.revision ? left : right
  return left.updatedAt >= right.updatedAt ? left : right
}
