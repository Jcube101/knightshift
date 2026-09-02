// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { readDefaults, saveDefaults } from './defaults'
import { loadSyncOutbox } from './sync/outbox'

beforeEach(() => localStorage.clear())

describe('defaults', () => {
  it('queues settings after saving them locally', () => {
    saveDefaults({ side: 'b', difficulty: 'Sharp' })

    expect(readDefaults()).toEqual({ side: 'b', difficulty: 'Sharp' })
    expect(loadSyncOutbox().map(operation => operation.id)).toEqual(['settings'])
  })
})
