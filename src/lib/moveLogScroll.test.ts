import { describe, expect, it } from 'vitest'
import { latestMoveScrollLeft } from './moveLogScroll'

describe('latestMoveScrollLeft', () => {
  it('returns the rightmost scroll position for an overflowing move log', () => {
    expect(latestMoveScrollLeft({ scrollWidth: 640, clientWidth: 390 })).toBe(250)
  })

  it('does not create a negative scroll position for a short move log', () => {
    expect(latestMoveScrollLeft({ scrollWidth: 300, clientWidth: 390 })).toBe(0)
  })
})
