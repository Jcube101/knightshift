import { describe, expect, it } from 'vitest'
import { boardGridStyle } from './lib/boardLayout'

describe('chessboard layout', () => {
  it('uses eight fixed row tracks so every square stays the same height', () => {
    expect(boardGridStyle.gridTemplateRows).toBe('repeat(8, minmax(0, 1fr))')
  })
})
