// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { clearActiveGame, loadActiveGame, loadSavedGames, saveActiveGame, saveCompletedGame } from './storage'

beforeEach(() => localStorage.clear())

describe('completed-game storage', () => {
  it('saves a completed game and returns newest games first', () => {
    saveCompletedGame({ id: 'first', playedAt: '2026-08-22T09:00:00.000Z', result: '1-0', moves: ['e4', 'e5'] })
    saveCompletedGame({ id: 'second', playedAt: '2026-08-23T09:00:00.000Z', result: '0-1', moves: ['d4', 'd5'] })

    expect(loadSavedGames().map((game) => game.id)).toEqual(['second', 'first'])
  })

  it('restores a versioned active game checkpoint', () => {
    const activeGame = {
      game: { fen: 'start', history: ['e4', 'e5'], uciHistory: ['e2e4', 'e7e5'] },
      playerColor: 'w' as const,
      difficulty: 'Steady',
      lastCapture: null,
    }

    saveActiveGame(activeGame)

    expect(loadActiveGame()).toEqual(activeGame)
  })

  it('clears an active game checkpoint without touching completed games', () => {
    saveCompletedGame({ id: 'completed', playedAt: '2026-08-23T09:00:00.000Z', result: '1-0', moves: ['e4', 'e5'] })
    saveActiveGame({ game: { fen: 'start', history: [], uciHistory: [] }, playerColor: 'w', difficulty: 'Steady', lastCapture: null })

    clearActiveGame()

    expect(loadActiveGame()).toBeNull()
    expect(loadSavedGames().map((game) => game.id)).toEqual(['completed'])
  })

  it('reads completed games saved in the legacy array format', () => {
    localStorage.setItem('knightshift.completed-games', JSON.stringify([{ id: 'legacy', playedAt: '2026-08-22T09:00:00.000Z', result: '1-0', moves: ['e4'] }]))

    expect(loadSavedGames().map((game) => game.id)).toEqual(['legacy'])
  })

  it('returns no games when browser storage is empty', () => {
    expect(loadSavedGames()).toEqual([])
  })
})
