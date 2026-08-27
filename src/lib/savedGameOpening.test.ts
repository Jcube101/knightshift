import { describe, expect, it } from 'vitest'
import { openingForSavedGame } from './savedGameOpening'

describe('openingForSavedGame', () => {
  it('derives opening context for legacy saved games without rewriting them', () => {
    expect(openingForSavedGame({ id: 'legacy', playedAt: '2026-08-27T00:00:00.000Z', result: '1-0', moves: ['e4', 'c5'] })).toMatchObject({ status: 'identified', opening: 'Sicilian Defense' })
  })
})
