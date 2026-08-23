import { describe, expect, it } from 'vitest'
import { describeGameResult } from './resultMessage'

describe('describeGameResult', () => {
  it('celebrates a player checkmate win', () => {
    expect(describeGameResult({ result: '1-0', termination: 'checkmate' }, 'w')).toEqual({
      title: 'Checkmate. You win.',
      detail: 'The game is over and has been saved to your local database.',
    })
  })

  it('identifies a stalemate as a draw', () => {
    expect(describeGameResult({ result: '1/2-1/2', termination: 'stalemate' }, 'b')).toEqual({
      title: 'Draw by stalemate.',
      detail: 'Neither side has a legal move. The game has been saved to your local database.',
    })
  })

  it('identifies other drawn games without calling them stalemate', () => {
    expect(describeGameResult({ result: '1/2-1/2', termination: 'draw' }, 'w')).toEqual({
      title: 'Draw.',
      detail: 'The game is over and has been saved to your local database.',
    })
  })
})
