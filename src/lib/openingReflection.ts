import type { CriticalMoment } from './analysis'
import type { OpeningClassification } from './openingClassification'

export type OpeningReflection =
  | { kind: 'not-analysed' }
  | { kind: 'during-recognised-line'; moveNumber: number }
  | { kind: 'after-recognised-line'; moveNumber: number }
  | { kind: 'unavailable' }

export function openingReflection(opening: OpeningClassification, analysis: CriticalMoment[] | undefined): OpeningReflection {
  if (!analysis) return { kind: 'not-analysed' }
  if (opening.status === 'unidentified') return { kind: 'unavailable' }
  const first = analysis.toSorted((left, right) => (left.moveIndex ?? Infinity) - (right.moveIndex ?? Infinity))[0]
  if (!first) return { kind: 'not-analysed' }
  return (first.moveIndex ?? Infinity) < opening.matchedPly
    ? { kind: 'during-recognised-line', moveNumber: first.moveNumber }
    : { kind: 'after-recognised-line', moveNumber: first.moveNumber }
}
