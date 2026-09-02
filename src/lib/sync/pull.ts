import type { SavedGame } from '../storage'

type RemoteGame = { client_id: string; payload: unknown; deleted_at: string }

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).toSorted(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(',')}}`
  return JSON.stringify(value)
}

function savedGame(value: unknown): value is SavedGame {
  return Boolean(value && typeof value === 'object' && typeof (value as Partial<SavedGame>).id === 'string' && Array.isArray((value as Partial<SavedGame>).moves))
}

export function mergeRemoteGames(local: SavedGame[], remote: RemoteGame[]): SavedGame[] {
  const merged = new Map(local.map(game => [game.id, game]))

  for (const record of remote) {
    if (record.deleted_at) { merged.delete(record.client_id); continue }
    if (!savedGame(record.payload) || record.payload.id !== record.client_id) throw new Error(`Invalid remote completed game at ${record.client_id}.`)
    const existing = merged.get(record.client_id)
    if (existing && stable(existing) !== stable(record.payload)) throw new Error(`Completed game conflict at ${record.client_id}.`)
    merged.set(record.client_id, record.payload)
  }

  return [...merged.values()].toSorted((left, right) => right.playedAt.localeCompare(left.playedAt))
}
