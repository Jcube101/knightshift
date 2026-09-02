import PocketBase from 'pocketbase'
import { loadSavedGames, replaceSavedGamesForSync } from '../storage'
import { mergeRemoteGames } from './pull'
import { acknowledgeSyncOperation, loadSyncOutbox, type SyncOperation } from './outbox'

type RemoteRecord = { id: string; payload?: unknown; client_id?: string; deleted_at?: string }
type CollectionClient = {
  create(data: Record<string, unknown>): Promise<RemoteRecord>
  update(id: string, data: Record<string, unknown>): Promise<RemoteRecord>
  getFirstListItem(filter: string): Promise<RemoteRecord>
  getFullList(options?: Record<string, unknown>): Promise<RemoteRecord[]>
}

export type SyncClient = {
  authStore: { isValid: boolean; record: { id: string } | null }
  collection(name: string): CollectionClient
}

const baseUrl = 'https://pb-apps.job-joseph.com'
export const knightshiftPocketBase: SyncClient = new PocketBase(baseUrl)

function quoted(value: string): string { return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"` }
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).toSorted(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(',')}}`
  return JSON.stringify(value)
}

async function existing(collection: CollectionClient, filter: string): Promise<RemoteRecord | null> {
  try { return await collection.getFirstListItem(filter) }
  catch (error) {
    if (typeof error === 'object' && error && 'status' in error && error.status === 404) return null
    throw error
  }
}

function signedInUser(client: SyncClient): string {
  if (!client.authStore.isValid || !client.authStore.record?.id) throw new Error('Sign in before syncing.')
  return client.authStore.record.id
}

function gamePayload(operation: SyncOperation): { clientId: string; playedAt: string; payloadVersion: number; payload: unknown } {
  const value = operation.payload as { clientId: string; playedAt: string; payloadVersion: number; payload: unknown }
  return value
}

function candidatePayload(operation: SyncOperation): { gameClientId: string; moveIndex: number; syncKey: string; payloadVersion: number; payload: unknown } {
  return operation.payload as { gameClientId: string; moveIndex: number; syncKey: string; payloadVersion: number; payload: unknown }
}

async function pushOperation(client: SyncClient, owner: string, operation: SyncOperation): Promise<void> {
  if (operation.kind === 'completed-game') {
    const record = gamePayload(operation); const collection = client.collection('knightshift_games')
    const found = await existing(collection, `owner = ${quoted(owner)} && client_id = ${quoted(record.clientId)}`)
    const data = { owner, client_id: record.clientId, played_at: record.playedAt, payload_version: record.payloadVersion, payload: record.payload }
    if (found) await collection.update(found.id, data); else await collection.create(data)
    return
  }

  if (operation.kind === 'game-tombstone') {
    const record = operation.payload as { clientId: string; deletedAt: string }; const collection = client.collection('knightshift_games')
    const found = await existing(collection, `owner = ${quoted(owner)} && client_id = ${quoted(record.clientId)}`)
    if (found) await collection.update(found.id, { deleted_at: record.deletedAt })
    return
  }

  if (operation.kind === 'review-candidate') {
    const record = candidatePayload(operation); const collection = client.collection('knightshift_review_candidates')
    const found = await existing(collection, `owner = ${quoted(owner)} && sync_key = ${quoted(record.syncKey)}`)
    if (found) {
      if (stable(found.payload) !== stable(record.payload)) throw new Error(`Review candidate conflict at ${record.syncKey}.`)
      return
    }
    await collection.create({ owner, game_client_id: record.gameClientId, move_index: record.moveIndex, sync_key: record.syncKey, payload_version: record.payloadVersion, payload: record.payload })
    return
  }

  if (operation.kind === 'review-status') {
    const record = operation.payload as { gameClientId: string; payloadVersion: number; payload: unknown }; const collection = client.collection('knightshift_review_status')
    const found = await existing(collection, `owner = ${quoted(owner)} && game_client_id = ${quoted(record.gameClientId)}`)
    const data = { owner, game_client_id: record.gameClientId, payload_version: record.payloadVersion, payload: record.payload }
    if (found) await collection.update(found.id, data); else await collection.create(data)
    return
  }

  const record = operation.payload as { revision: number; payloadVersion: number; payload: unknown }; const collection = client.collection('knightshift_settings')
  const found = await existing(collection, `owner = ${quoted(owner)}`)
  const data = { owner, revision: record.revision, payload_version: record.payloadVersion, payload: record.payload }
  if (found) await collection.update(found.id, data); else await collection.create(data)
}

export async function flushSyncOutbox(client: SyncClient = knightshiftPocketBase): Promise<{ pushed: number }> {
  const owner = signedInUser(client)
  let pushed = 0
  for (const operation of loadSyncOutbox()) {
    await pushOperation(client, owner, operation)
    acknowledgeSyncOperation(operation.id)
    pushed += 1
  }
  return { pushed }
}

export async function pullCompletedGames(client: SyncClient = knightshiftPocketBase): Promise<{ pulled: number }> {
  const owner = signedInUser(client)
  const records = await client.collection('knightshift_games').getFullList({
    filter: `owner = ${quoted(owner)}`,
    fields: 'client_id,payload,deleted_at',
    sort: '-played_at',
  })
  const remote = records.map(record => ({ client_id: record.client_id ?? '', payload: record.payload, deleted_at: record.deleted_at ?? '' }))
  const previous = loadSavedGames()
  const merged = mergeRemoteGames(previous, remote)
  replaceSavedGamesForSync(merged)
  return { pulled: merged.filter(game => !previous.some(local => local.id === game.id)).length }
}

export async function signIn(email: string, password: string, client: SyncClient = knightshiftPocketBase): Promise<void> {
  const collection = client.collection('knightshift_users') as CollectionClient & { authWithPassword?(identity: string, secret: string): Promise<unknown> }
  if (!collection.authWithPassword) throw new Error('This PocketBase client cannot sign in.')
  await collection.authWithPassword(email, password)
}

export function signOut(client: SyncClient = knightshiftPocketBase): void {
  const authStore = client.authStore as { clear?: () => void }
  authStore.clear?.()
}
