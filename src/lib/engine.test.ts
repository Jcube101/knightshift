import { describe, expect, it } from 'vitest'
import { parseBestMove } from './engine'

describe('parseBestMove', () => {
  it('extracts a UCI best move from Stockfish output', () => {
    expect(parseBestMove('bestmove e7e5 ponder g1f3')).toBe('e7e5')
  })

  it('returns null for non-final engine output', () => {
    expect(parseBestMove('info depth 8 score cp 32 pv e7e5 g1f3')).toBeNull()
  })
})
