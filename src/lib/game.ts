import { Chess, type Move, type Square } from 'chess.js'
import type { GameTermination } from './resultMessage'

export type GameState = {
  fen: string
  history: string[]
  uciHistory: string[]
}

export type MoveInput = {
  from: string
  to: string
  promotion?: 'q' | 'r' | 'b' | 'n'
}

export type MoveResult =
  | { accepted: true; fen: string; san: string; history: string[]; uciHistory: string[]; result: '1-0' | '0-1' | '1/2-1/2' | null; termination: GameTermination | null }
  | { accepted: false; fen: string; history: string[]; uciHistory: string[] }

function termination(board: Chess): GameTermination | null {
  if (!board.isGameOver()) return null
  if (board.isStalemate()) return 'stalemate'
  if (board.isDraw()) return 'draw'
  return 'checkmate'
}

function outcome(board: Chess, winner: 'w' | 'b'): '1-0' | '0-1' | '1/2-1/2' | null {
  if (!board.isGameOver()) return null
  if (board.isDraw()) return '1/2-1/2'
  return winner === 'w' ? '1-0' : '0-1'
}

export function beginGame(): GameState {
  const board = new Chess()
  return { fen: board.fen(), history: [], uciHistory: [] }
}

function restore(game: GameState): Chess {
  const board = new Chess(game.fen)
  for (const move of game.history) board.move(move)
  return board
}

export function isPlayersPiece(game: GameState, square: string, color: 'w' | 'b'): boolean {
  return restore(game).get(square as Square)?.color === color
}

function toUci(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ''}`
}

export function playMove(game: GameState, input: MoveInput, playerColor: 'w' | 'b' = 'w'): MoveResult {
  const board = restore(game)
  let move: Move

  try {
    move = board.move(input)
  } catch {
    return { accepted: false, fen: game.fen, history: game.history, uciHistory: game.uciHistory }
  }

  return {
    accepted: true,
    fen: game.fen,
    san: move.san,
    history: [...game.history, move.san],
    uciHistory: [...game.uciHistory, toUci(move)],
    result: outcome(board, playerColor),
    termination: termination(board),
  }
}

export function applyEngineMove(game: GameState, uci: string, engineColor: 'w' | 'b' = 'b'): MoveResult {
  const board = restore(game)
  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci)
  if (!match) return { accepted: false, fen: game.fen, history: game.history, uciHistory: game.uciHistory }

  try {
    const move = board.move({ from: match[1], to: match[2], promotion: match[3] })
    return {
      accepted: true,
      fen: game.fen,
      san: move.san,
      history: [...game.history, move.san],
      uciHistory: [...game.uciHistory, toUci(move)],
      result: outcome(board, engineColor),
      termination: termination(board),
    }
  } catch {
    return { accepted: false, fen: game.fen, history: game.history, uciHistory: game.uciHistory }
  }
}
