// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { acknowledgeSyncOperation, enqueueSyncOperation, loadSyncOutbox } from './outbox'

beforeEach(() => localStorage.clear())

describe('sync outbox', () => {
  it('deduplicates a repeated completed-game operation by stable operation id', () => {
    enqueueSyncOperation({ id: 'game:game-1', kind: 'completed-game', payload: { id: 'game-1', result: '1-0' }, createdAt: '2026-09-02T10:00:00.000Z' })
    enqueueSyncOperation({ id: 'game:game-1', kind: 'completed-game', payload: { id: 'game-1', result: '0-1' }, createdAt: '2026-09-02T10:01:00.000Z' })

    expect(loadSyncOutbox()).toEqual([
      { id: 'game:game-1', kind: 'completed-game', payload: { id: 'game-1', result: '0-1' }, createdAt: '2026-09-02T10:01:00.000Z' },
    ])
  })

  it('keeps independently mergeable review candidates as separate operations', () => {
    enqueueSyncOperation({ id: 'candidate:game-1:0', kind: 'review-candidate', payload: { moveIndex: 0 }, createdAt: '2026-09-02T10:00:00.000Z' })
    enqueueSyncOperation({ id: 'candidate:game-1:2', kind: 'review-candidate', payload: { moveIndex: 2 }, createdAt: '2026-09-02T10:01:00.000Z' })

    expect(loadSyncOutbox().map(operation => operation.id)).toEqual(['candidate:game-1:0', 'candidate:game-1:2'])
  })

  it('removes only an acknowledged operation', () => {
    enqueueSyncOperation({ id: 'game:game-1', kind: 'completed-game', payload: {}, createdAt: '2026-09-02T10:00:00.000Z' })
    enqueueSyncOperation({ id: 'settings', kind: 'settings', payload: {}, createdAt: '2026-09-02T10:01:00.000Z' })

    acknowledgeSyncOperation('game:game-1')

    expect(loadSyncOutbox().map(operation => operation.id)).toEqual(['settings'])
  })

  it('recovers from malformed persisted outbox data without touching game storage', () => {
    localStorage.setItem('knightshift.sync-outbox', '{not-json')
    localStorage.setItem('knightshift.completed-games', JSON.stringify([{ id: 'game-1' }]))

    expect(loadSyncOutbox()).toEqual([])
    expect(localStorage.getItem('knightshift.completed-games')).toBe(JSON.stringify([{ id: 'game-1' }]))
  })
})
