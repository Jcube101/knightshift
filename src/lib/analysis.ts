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
  if (loss >= 250) return { label: 'Major tactical loss', explanation: 'This created a large tactical swing.' }
  if (loss >= 120) return { label: 'Significant mistake', explanation: 'This changed the balance of the position.' }
  return { label: 'Missed opportunity', explanation: 'A stronger option was available.' }
}

export function moveToSan(fen: string, uci: string): string {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) return uci
  const chess = new Chess(fen)
  try {
    return chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }).san
  } catch {
    return uci
  }
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
