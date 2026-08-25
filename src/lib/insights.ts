import { Chess, type Square } from 'chess.js'

export type InsightGame = {
  analysis?: Array<{ afterFen?: string; replyUci?: string } & Record<string, unknown>>
} & Record<string, unknown>

export type Insight = {
  kind: 'piece-loss' | 'check-allowed' | 'fork'
  count: number
  label: string
}

function eventKind(fen: string, uci: string): Insight['kind'] | null {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) return null
  try {
    const chess = new Chess(fen)
    const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })
    if (move.captured && move.captured !== 'k') return 'piece-loss'
    if (move.san.endsWith('+') || move.san.endsWith('#')) return 'check-allowed'
    const opponent = move.color === 'w' ? 'b' : 'w'
    const attackedPieces = ('abcdefgh'.split('').flatMap((file) => '12345678'.split('').map((rank) => `${file}${rank}`)) as Square[]).filter((square) => {
      const piece = chess.get(square)
      return piece?.color === opponent && piece.type !== 'p' && piece.type !== 'k' && chess.isAttacked(square, move.color)
    })
    if (attackedPieces.length >= 2) return 'fork'
  } catch {
    return null
  }
  return null
}

export function summarizeInsights(games: InsightGame[]): Insight[] {
  const counts: Record<Insight['kind'], number> = { 'piece-loss': 0, 'check-allowed': 0, fork: 0 }
  for (const game of games) for (const moment of game.analysis ?? []) {
    if (!moment.afterFen || !moment.replyUci) continue
    const kind = eventKind(moment.afterFen, moment.replyUci)
    if (kind) counts[kind] += 1
  }
  return ([
    { kind: 'piece-loss', count: counts['piece-loss'], label: 'Pieces lost to a critical reply' },
    { kind: 'check-allowed', count: counts['check-allowed'], label: 'Critical replies that gave check' },
    { kind: 'fork', count: counts.fork, label: 'Forks allowed in critical moments' },
  ] as Insight[]).filter((insight) => insight.count > 0)
}
