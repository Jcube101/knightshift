import { enqueueSyncOperation } from './sync/outbox'
import { settingsRecord } from './sync/records'

export type Defaults = { side: 'w' | 'b'; difficulty: 'Casual' | 'Steady' | 'Sharp' }
type StoredDefaults = { version: 1; revision: number; defaults: Defaults }

const defaultsKey = 'knightshift.defaults'
const fallbackDefaults: Defaults = { side: 'w', difficulty: 'Steady' }

function validDefaults(value: unknown): Defaults {
  const stored = value as Partial<Defaults>
  return { side: stored?.side === 'b' ? 'b' : 'w', difficulty: stored?.difficulty === 'Casual' || stored?.difficulty === 'Sharp' ? stored.difficulty : 'Steady' }
}

function stored(): StoredDefaults {
  try {
    const value = JSON.parse(localStorage.getItem(defaultsKey) ?? '{}') as unknown
    if (value && typeof value === 'object' && 'version' in value && value.version === 1 && 'revision' in value && typeof value.revision === 'number' && 'defaults' in value) return { version: 1, revision: value.revision, defaults: validDefaults(value.defaults) }
    return { version: 1, revision: 0, defaults: validDefaults(value) }
  } catch { return { version: 1, revision: 0, defaults: fallbackDefaults } }
}

function persist(value: StoredDefaults): void { localStorage.setItem(defaultsKey, JSON.stringify(value)) }
export function readDefaults(): Defaults { return stored().defaults }
export function readDefaultsRevision(): number { return stored().revision }
export function applyRemoteDefaults(defaults: Defaults, revision: number): boolean {
  if (revision <= readDefaultsRevision()) return false
  persist({ version: 1, revision, defaults: validDefaults(defaults) })
  return true
}
export function saveDefaults(defaults: Defaults): void {
  const revision = Math.max(Date.now(), readDefaultsRevision() + 1)
  const value = { version: 1 as const, revision, defaults: validDefaults(defaults) }
  persist(value)
  enqueueSyncOperation({ id: 'settings', kind: 'settings', payload: settingsRecord(value.defaults, revision), createdAt: new Date().toISOString() })
}
