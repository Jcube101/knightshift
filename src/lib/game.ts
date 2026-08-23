import { Chess, type Move } from 'chess.js'

export type GameState = {
  fen: string
  history: string[]
}

export type MoveInput = {
  from: string
  to: string
  promotion?: 'q' | 'r' | 'b' | 'n'
}

export type MoveResult =
  | { accepted: true; fen: string; san: string; botMove: string | null; history: string[]; result: '1-0' | '0-1' | '1/2-1/2' | null }
  | { accepted: false; fen: string; botMove: null; history: string[] }

function outcome(board: Chess, winner: 'w' | 'b'): '1-0' | '0-1' | '1/2-1/2' | null {
  if (!board.isGameOver()) return null
  if (board.isDraw()) return '1/2-1/2'
  return winner === 'w' ? '1-0' : '0-1'
}

export function beginGame(): GameState {
  const board = new Chess()
  return { fen: board.fen(), history: [] }
}

function restore(game: GameState): Chess {
  const board = new Chess(game.fen)
  for (const move of game.history) board.move(move)
  return board
}

function toUci(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ''}`
}

const pieceValues: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }

function positionScore(board: Chess): number {
  let score = 0
  for (const rank of board.board()) {
    for (const piece of rank) {
      if (!piece) continue
      const value = pieceValues[piece.type]
      score += piece.color === 'b' ? value : -value
    }
  }
  return score
}

function moveScore(board: Chess, move: Move): number {
  const trial = new Chess(board.fen())
  trial.move(move)
  const centerBonus = ['c', 'd', 'e', 'f'].includes(move.to[0]) ? 18 : 0
  const developmentBonus = ['n', 'b'].includes(move.piece) ? 10 : 0
  const earlyRookPenalty = move.piece === 'r' ? -30 : 0
  return positionScore(trial) + centerBonus + developmentBonus + earlyRookPenalty
}

function recentBotMoves(game: GameState): Set<string> {
  const board = new Chess(game.fen)
  const moves = new Set<string>()
  for (const [index, san] of game.history.entries()) {
    const move = board.move(san)
    if (index % 2 === 1) moves.add(toUci(move))
  }
  return moves
}

function chooseBotMove(board: Chess, game: GameState): Move | undefined {
  const recentMoves = recentBotMoves(game)
  return board.moves({ verbose: true }).toSorted((left, right) => {
    const leftScore = moveScore(board, left) - (recentMoves.has(toUci(left)) ? 500 : 0)
    const rightScore = moveScore(board, right) - (recentMoves.has(toUci(right)) ? 500 : 0)
    return rightScore - leftScore || toUci(left).localeCompare(toUci(right))
  })[0]
}

export function playMove(game: GameState, input: MoveInput): MoveResult {
  const board = restore(game)
  let playerMove: Move

  try {
    playerMove = board.move(input)
  } catch {
    return { accepted: false, fen: game.fen, botMove: null, history: game.history }
  }

  const history = [...game.history, playerMove.san]
  const playerOutcome = outcome(board, 'w')
  if (playerOutcome) {
    return { accepted: true, fen: board.fen(), san: playerMove.san, botMove: null, history, result: playerOutcome }
  }

  const reply = chooseBotMove(board, game)
  if (!reply) {
    return { accepted: true, fen: board.fen(), san: playerMove.san, botMove: null, history, result: outcome(board, 'w') }
  }

  const botMove = board.move(reply)
  return {
    accepted: true,
    fen: board.fen(),
    san: playerMove.san,
    botMove: toUci(botMove),
    history: [...history, botMove.san],
    result: outcome(board, 'b'),
  }
}
