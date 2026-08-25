import { describe, expect, it } from 'vitest'
import { positionBeforeMove, selectCriticalMoments } from './analysis'

describe('selectCriticalMoments', () => {
  it('returns the three largest meaningful player evaluation drops', () => {
    const moments = selectCriticalMoments([
      { moveNumber: 4, played: 'h3', best: 'Nf3', loss: 42 },
      { moveNumber: 11, played: 'Qh5', best: 'Be3', loss: 128 },
      { moveNumber: 18, played: 'g4', best: 'O-O', loss: 305 },
      { moveNumber: 23, played: 'Bf4', best: 'Re1', loss: 91 },
      { moveNumber: 27, played: 'a3', best: 'h3', loss: 76 },
    ])

    expect(moments.map((moment) => moment.played)).toEqual(['g4', 'Qh5', 'Bf4'])
    expect(moments[0].label).toBe('Major tactical loss')
  })

  it('recreates the board position immediately before the reviewed move', () => {
    expect(positionBeforeMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', ['e4', 'e5', 'Nf3'], 2)).toBe('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2')
  })
})
