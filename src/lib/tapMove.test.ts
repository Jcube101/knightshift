import { describe, expect, it } from 'vitest'
import { resolveTap } from './tapMove'

describe('resolveTap', () => {
  it('turns two mobile square taps into a move request', () => {
    expect(resolveTap(null, 'e2')).toEqual({ selected: 'e2', move: null })
    expect(resolveTap('e2', 'e4')).toEqual({ selected: null, move: { from: 'e2', to: 'e4' } })
  })
})
