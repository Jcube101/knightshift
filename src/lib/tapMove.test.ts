import { describe, expect, it } from 'vitest'
import { resolveTap } from './tapMove'

describe('resolveTap', () => {
  it('does not select an empty square when no white piece is selected', () => {
    expect(resolveTap(null, 'd4', false)).toEqual({ selected: null, move: null })
  })

  it('selects a white piece, then turns a destination tap into a move without clearing the source', () => {
    expect(resolveTap(null, 'd2', true)).toEqual({ selected: 'd2', move: null })
    expect(resolveTap('d2', 'd4', false)).toEqual({ selected: 'd2', move: { from: 'd2', to: 'd4' } })
  })

  it('switches selection when another white piece is tapped', () => {
    expect(resolveTap('e2', 'd2', true)).toEqual({ selected: 'd2', move: null })
  })
})
