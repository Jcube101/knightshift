// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { loadSavedGames, saveCompletedGame } from './storage'

beforeEach(() => localStorage.clear())

describe('completed-game storage', () => {
  it('saves a completed game and returns newest games first', () => {
    saveCompletedGame({ id: 'first', playedAt: '2026-08-22T09:00:00.000Z', result: '1-0', moves: ['e4', 'e5'] })
    saveCompletedGame({ id: 'second', playedAt: '2026-08-23T09:00:00.000Z', result: '0-1', moves: ['d4', 'd5'] })

    expect(loadSavedGames().map((game) => game.id)).toEqual(['second', 'first'])
  })

  it('returns no games when browser storage is empty', () => {
    expect(loadSavedGames()).toEqual([])
  })
})
