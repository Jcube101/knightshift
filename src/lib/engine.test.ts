import { describe, expect, it } from 'vitest'
import { parseBestMove, parseScore } from './engine'

describe('parseBestMove', () => {
  it('extracts a UCI best move from Stockfish output', () => {
    expect(parseBestMove('bestmove e7e5 ponder g1f3')).toBe('e7e5')
  })

  it('extracts a centipawn score and principal variation from Stockfish info', () => {
    expect(parseScore('info depth 12 score cp -143 pv e7e5 g1f3')).toEqual({ centipawns: -143, bestMove: 'e7e5' })
  })

  it('returns null for non-final engine output', () => {
    expect(parseBestMove('info depth 8 score cp 32 pv e7e5 g1f3')).toBeNull()
  })
})
