import { describe, expect, it } from 'vitest'
import { boardGridStyle } from './boardLayout'

describe('board grid layout', () => {
  it('defines eight equal row tracks', () => {
    expect(boardGridStyle.gridTemplateRows).toBe('repeat(8, minmax(0, 1fr))')
  })
})
