// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { enqueueSyncOperation, loadSyncOutbox } from './outbox'
import { flushSyncOutbox, pullCompletedGames, type SyncClient } from './client'
import { loadSavedGames } from '../storage'

type TestClient = SyncClient & { collection: ReturnType<typeof vi.fn> }

function client({ userId = 'user-1', existing = null, remoteGames = [] }: { userId?: string | null; existing?: Record<string, unknown> | null; remoteGames?: Record<string, unknown>[] } = {}): TestClient {
  const create = vi.fn().mockResolvedValue({ id: 'remote-1' })
  const update = vi.fn().mockResolvedValue({ id: 'remote-1' })
  const getFullList = vi.fn().mockResolvedValue(remoteGames)
  const getFirstListItem = vi.fn().mockImplementation(async () => {
    if (existing) return existing
    throw { status: 404 }
  })
  return {
    authStore: { isValid: Boolean(userId), record: userId ? { id: userId } : null },
    collection: vi.fn(() => ({ create, update, getFirstListItem, getFullList })),
  }
}

beforeEach(() => localStorage.clear())

describe('PocketBase sync client', () => {
  it('does not flush local work without a signed-in user', async () => {
    enqueueSyncOperation({ id: 'settings', kind: 'settings', payload: { collection: 'knightshift_settings', revision: 0, payloadVersion: 1, payload: { side: 'w', difficulty: 'Steady' } }, createdAt: '2026-09-02T10:00:00.000Z' })

    await expect(flushSyncOutbox(client({ userId: null }))).rejects.toThrow('Sign in before syncing.')
    expect(loadSyncOutbox()).toHaveLength(1)
  })

  it('creates an owner-scoped completed game and acknowledges it only after success', async () => {
    enqueueSyncOperation({ id: 'game:game-1', kind: 'completed-game', payload: { collection: 'knightshift_games', clientId: 'game-1', playedAt: '2026-09-02T10:00:00.000Z', payloadVersion: 1, payload: { id: 'game-1', result: '1-0', moves: [] } }, createdAt: '2026-09-02T10:00:00.000Z' })
    const pb = client()

    await expect(flushSyncOutbox(pb)).resolves.toEqual({ pushed: 1 })

    expect(pb.collection).toHaveBeenCalledWith('knightshift_games')
    expect((pb.collection.mock.results[0].value.create as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(expect.objectContaining({ owner: 'user-1', client_id: 'game-1' }))
    expect(loadSyncOutbox()).toEqual([])
  })

  it('updates an existing game with a tombstone instead of physically deleting it', async () => {
    enqueueSyncOperation({ id: 'game-tombstone:game-1', kind: 'game-tombstone', payload: { collection: 'knightshift_games', clientId: 'game-1', deletedAt: '2026-09-02T11:00:00.000Z' }, createdAt: '2026-09-02T11:00:00.000Z' })
    const pb = client({ existing: { id: 'remote-game-1' } })

    await flushSyncOutbox(pb)

    expect((pb.collection.mock.results[0].value.update as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith('remote-game-1', { deleted_at: '2026-09-02T11:00:00.000Z' })
  })

  it('pulls remote completed games and applies tombstones without queueing writes', async () => {
    const pb = client({ remoteGames: [
      { client_id: 'remote-game', payload: { id: 'remote-game', playedAt: '2026-09-02T12:00:00.000Z', result: '1-0', moves: ['e4'] }, deleted_at: '' },
      { client_id: 'local-game', payload: { id: 'local-game', playedAt: '2026-09-02T10:00:00.000Z', result: '0-1', moves: ['d4'] }, deleted_at: '2026-09-02T13:00:00.000Z' },
    ] })
    enqueueSyncOperation({ id: 'keep', kind: 'settings', payload: { collection: 'knightshift_settings', revision: 0, payloadVersion: 1, payload: {} }, createdAt: '2026-09-02T10:00:00.000Z' })

    await expect(pullCompletedGames(pb)).resolves.toEqual({ pulled: 1 })
    expect(loadSavedGames().map(game => game.id)).toEqual(['remote-game'])
    expect(loadSyncOutbox()).toHaveLength(1)
  })

  it('does not overwrite conflicting review evidence or acknowledge the operation', async () => {
    enqueueSyncOperation({ id: 'candidate:game-1:0', kind: 'review-candidate', payload: { collection: 'knightshift_review_candidates', gameClientId: 'game-1', moveIndex: 0, syncKey: 'game-1:0', payloadVersion: 1, payload: { moveIndex: 0, played: 'e4', best: 'e5', loss: 90 } }, createdAt: '2026-09-02T10:00:00.000Z' })
    const pb = client({ existing: { id: 'remote-candidate-1', payload: { moveIndex: 0, played: 'e4', best: 'd4', loss: 90 } } })

    await expect(flushSyncOutbox(pb)).rejects.toThrow('Review candidate conflict at game-1:0.')
    expect(loadSyncOutbox()).toHaveLength(1)
  })
})
