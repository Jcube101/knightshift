import { describe, expect, it } from 'vitest'
import { beginGame, playMove } from './game'

describe('playMove', () => {
  it('accepts a legal player move and returns a legal bot reply', () => {
    const game = beginGame()

    const result = playMove(game, { from: 'e2', to: 'e4' })

    expect(result.accepted).toBe(true)
    if (!result.accepted) throw new Error('expected legal move to be accepted')
    expect(result.san).toBe('e4')
    expect(result.fen).not.toBe(game.fen)
    expect(result.botMove).toMatch(/^[a-h][1-8][a-h][1-8][qrbn]?$/)
  })

  it('reports a player checkmate as a completed win', () => {
    const game = { fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1', history: [] }

    const result = playMove(game, { from: 'f7', to: 'g7' })

    expect(result).toMatchObject({ accepted: true, botMove: null, result: '1-0' })
  })

  it('rejects an illegal move without changing the position', () => {
    const game = beginGame()

    const result = playMove(game, { from: 'e2', to: 'e5' })

    expect(result.accepted).toBe(false)
    expect(result.fen).toBe(game.fen)
    expect(result.botMove).toBeNull()
  })
})
