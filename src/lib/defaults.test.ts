// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { applyRemoteDefaults, readDefaults, readDefaultsRevision, saveDefaults } from './defaults'
import { loadSyncOutbox } from './sync/outbox'

beforeEach(() => localStorage.clear())

describe('defaults', () => {
  it('queues settings after saving them locally with a revision', () => {
    saveDefaults({ side: 'b', difficulty: 'Sharp' })

    expect(readDefaults()).toEqual({ side: 'b', difficulty: 'Sharp' })
    expect(readDefaultsRevision()).toBeGreaterThan(0)
    expect(loadSyncOutbox().map(operation => operation.id)).toEqual(['settings'])
  })

  it('accepts a newer remote defaults record but preserves a newer local choice', () => {
    localStorage.setItem('knightshift.defaults', JSON.stringify({ version: 1, revision: 10, defaults: { side: 'w', difficulty: 'Steady' } }))

    expect(applyRemoteDefaults({ side: 'b', difficulty: 'Sharp' }, 11)).toBe(true)
    expect(readDefaults()).toEqual({ side: 'b', difficulty: 'Sharp' })
    expect(applyRemoteDefaults({ side: 'w', difficulty: 'Casual' }, 10)).toBe(false)
    expect(readDefaults()).toEqual({ side: 'b', difficulty: 'Sharp' })
  })
})
