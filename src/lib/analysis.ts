import { Chess } from 'chess.js'

export type CandidateMoment = {
  moveNumber: number
  played: string
  best: string
  loss: number
  moveIndex?: number
  beforeFen?: string
  playedUci?: string
  afterFen?: string
  replyUci?: string
}

export type CriticalMoment = CandidateMoment & {
  rank: number
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

const pieceNames = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen' } as const

export function describeReply(fen: string, uci: string): string | null {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) return null
  const chess = new Chess(fen)
  try {
    const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })
    if (move.captured && move.captured !== 'k') return `${move.san} wins your ${pieceNames[move.captured]}.`
    if (move.san.endsWith('+') || move.san.endsWith('#')) return `${move.san} gives check.`
    return `${move.san} is Stockfish’s best reply.`
  } catch {
    return null
  }
}

export function positionBeforeMove(initialFen: string, history: string[], moveIndex: number): string {
  const chess = new Chess(initialFen)
  for (const move of history.slice(0, moveIndex)) chess.move(move)
  return chess.fen()
}

export function selectCriticalMoments(candidates: CandidateMoment[]): CriticalMoment[] {
  const strongest = candidates
    .filter((candidate) => candidate.loss >= 75)
    .toSorted((left, right) => right.loss - left.loss)
    .slice(0, 3)
    .map((candidate, index) => ({ ...candidate, rank: index + 1, ...classify(candidate.loss) }))
  return strongest.toSorted((left, right) => left.moveNumber - right.moveNumber)
}
