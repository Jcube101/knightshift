import { describe, expect, it } from 'vitest'
import { selectCriticalMoments } from './analysis'

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
})
