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
  | { accepted: true; fen: string; san: string; botMove: string | null; history: string[] }
  | { accepted: false; fen: string; botMove: null; history: string[] }

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

export function playMove(game: GameState, input: MoveInput): MoveResult {
  const board = restore(game)
  let playerMove: Move

  try {
    playerMove = board.move(input)
  } catch {
    return { accepted: false, fen: game.fen, botMove: null, history: game.history }
  }

  const history = [...game.history, playerMove.san]
  const reply = board.moves({ verbose: true })[0]
  if (!reply) {
    return { accepted: true, fen: board.fen(), san: playerMove.san, botMove: null, history }
  }

  const botMove = board.move(reply)
  return {
    accepted: true,
    fen: board.fen(),
    san: playerMove.san,
    botMove: toUci(botMove),
    history: [...history, botMove.san],
  }
}
