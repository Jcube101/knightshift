import { Chess } from 'chess.js'

export type CandidateMoment = {
  moveNumber: number
  played: string
  best: string
  loss: number
  moveIndex?: number
  beforeFen?: string
  playedUci?: string
}

export type CriticalMoment = CandidateMoment & {
  label: 'Major tactical loss' | 'Significant mistake' | 'Missed opportunity'
  explanation: string
}

function classify(loss: number): Pick<CriticalMoment, 'label' | 'explanation'> {
  if (loss >= 250) return { label: 'Major tactical loss', explanation: 'This move gave away a large amount of evaluation. Compare it closely with Stockfish’s preferred continuation.' }
  if (loss >= 120) return { label: 'Significant mistake', explanation: 'This was the point where your position changed materially for the worse.' }
  return { label: 'Missed opportunity', explanation: 'This was a meaningful inaccuracy, but less severe than the larger moments above.' }
}

export function positionBeforeMove(initialFen: string, history: string[], moveIndex: number): string {
  const chess = new Chess(initialFen)
  for (const move of history.slice(0, moveIndex)) chess.move(move)
  return chess.fen()
}

export function selectCriticalMoments(candidates: CandidateMoment[]): CriticalMoment[] {
  return candidates
    .filter((candidate) => candidate.loss >= 75)
    .toSorted((left, right) => right.loss - left.loss)
    .slice(0, 3)
    .map((candidate) => ({ ...candidate, ...classify(candidate.loss) }))
}
