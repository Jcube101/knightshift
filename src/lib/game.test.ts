import { describe, expect, it } from 'vitest'
import { applyEngineMove, beginGame, isPlayersPiece, playMove } from './game'

describe('playMove', () => {
  it('accepts a legal player move and records its UCI form for Stockfish', () => {
    const game = beginGame()

    const result = playMove(game, { from: 'e2', to: 'e4' })

    expect(result.accepted).toBe(true)
    if (!result.accepted) throw new Error('expected legal move to be accepted')
    expect(result.san).toBe('e4')
    expect(result.uciHistory).toEqual(['e2e4'])
  })

  it('applies Stockfish UCI output as the bot move', () => {
    const afterPlayerMove = playMove(beginGame(), { from: 'e2', to: 'e4' })
    if (!afterPlayerMove.accepted) throw new Error('expected legal move to be accepted')

    const result = applyEngineMove({ fen: afterPlayerMove.fen, history: afterPlayerMove.history, uciHistory: afterPlayerMove.uciHistory }, 'e7e5')

    expect(result).toMatchObject({ accepted: true, san: 'e5', uciHistory: ['e2e4', 'e7e5'] })
  })

  it('waits for the engine instead of selecting a local heuristic reply', () => {
    const result = playMove(beginGame(), { from: 'd2', to: 'd3' })

    expect(result).toMatchObject({ accepted: true, history: ['d3'], uciHistory: ['d2d3'] })
  })

  it('reports a player checkmate as a completed win', () => {
    const game = { fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1', history: [], uciHistory: [] }

    const result = playMove(game, { from: 'f7', to: 'g7' })

    expect(result).toMatchObject({ accepted: true, result: '1-0' })
  })

  it('rejects an illegal move without changing the position', () => {
    const game = beginGame()

    const result = playMove(game, { from: 'e2', to: 'e5' })

    expect(result.accepted).toBe(false)
    expect(result.fen).toBe(game.fen)
    expect(result.uciHistory).toEqual(game.uciHistory)
  })

  it('identifies player-owned pieces from the canonical game position', () => {
    const game = beginGame()

    expect(isPlayersPiece(game, 'd2', 'w')).toBe(true)
    expect(isPlayersPiece(game, 'd4', 'w')).toBe(false)
    expect(isPlayersPiece(game, 'd7', 'w')).toBe(false)
  })
})
