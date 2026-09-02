import { describe, expect, it } from 'vitest'
import type { SavedGame } from '../storage'
import { mergeRemoteGames } from './pull'

const game: SavedGame = { id: 'game-1', playedAt: '2026-09-02T10:00:00.000Z', result: '1-0', moves: ['e4', 'e5'] }

describe('remote completed-game pull', () => {
  it('imports a remote completed game that is absent locally', () => {
    expect(mergeRemoteGames([], [{ client_id: 'game-1', payload: game, deleted_at: '' }])).toEqual([game])
  })

  it('keeps a locally saved identical game only once', () => {
    expect(mergeRemoteGames([game], [{ client_id: 'game-1', payload: game, deleted_at: '' }])).toEqual([game])
  })

  it('suppresses a locally saved game when its remote tombstone is present', () => {
    expect(mergeRemoteGames([game], [{ client_id: 'game-1', payload: game, deleted_at: '2026-09-02T11:00:00.000Z' }])).toEqual([])
  })

  it('rejects a divergent payload sharing a stable completed-game id', () => {
    expect(() => mergeRemoteGames([game], [{ client_id: 'game-1', payload: { ...game, result: '0-1' }, deleted_at: '' }]))
      .toThrow('Completed game conflict at game-1.')
  })
})
