export type SyncOperation = {
  id: string
  kind: 'completed-game' | 'review-candidate' | 'review-status' | 'settings'
  payload: unknown
  createdAt: string
}

const outboxKey = 'knightshift.sync-outbox'

function validOperation(value: unknown): value is SyncOperation {
  if (!value || typeof value !== 'object') return false
  const operation = value as Partial<SyncOperation>
  return typeof operation.id === 'string'
    && (operation.kind === 'completed-game' || operation.kind === 'review-candidate' || operation.kind === 'review-status' || operation.kind === 'settings')
    && typeof operation.createdAt === 'string'
    && 'payload' in operation
}

export function loadSyncOutbox(): SyncOperation[] {
  try {
    const value = JSON.parse(localStorage.getItem(outboxKey) ?? '[]') as unknown
    return Array.isArray(value) && value.every(validOperation) ? value : []
  } catch {
    return []
  }
}

export function enqueueSyncOperation(operation: SyncOperation): void {
  const remaining = loadSyncOutbox().filter(saved => saved.id !== operation.id)
  localStorage.setItem(outboxKey, JSON.stringify([...remaining, operation]))
}

export function acknowledgeSyncOperation(operationId: string): void {
  localStorage.setItem(outboxKey, JSON.stringify(loadSyncOutbox().filter(operation => operation.id !== operationId)))
}
