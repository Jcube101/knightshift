import type { CriticalMoment } from './analysis'
import type { OpeningClassification } from './openingClassification'
import type { GameTermination } from './resultMessage'
import { completedGameRecord } from './sync/records'
import { enqueueSyncOperation } from './sync/outbox'
import type { GameState } from './game'

export type SavedGame = {
  id: string
  playedAt: string
  result: '1-0' | '0-1' | '1/2-1/2'
  termination?: GameTermination
  moves: string[]
  playerColor?: 'w' | 'b'
  difficulty?: string
  analysis?: CriticalMoment[]
  analysisVersion?: 1
  opening?: OpeningClassification
}

export type ActiveGame = {
  game: GameState
  playerColor: 'w' | 'b'
  difficulty: string
  lastCapture: string | null
}

type CompletedGamesEnvelope = { version: 1; games: SavedGame[] }
type ActiveGameEnvelope = { version: 1; activeGame: ActiveGame }

const completedGamesKey = 'knightshift.completed-games'
const activeGameKey = 'knightshift.active-game'

function parseStoredValue(key: string): unknown {
  const saved = localStorage.getItem(key)
  if (!saved) return null
  try {
    return JSON.parse(saved) as unknown
  } catch {
    return null
  }
}

function storedGames(value: unknown): SavedGame[] {
  if (Array.isArray(value)) return value as SavedGame[]
  if (value && typeof value === 'object' && 'version' in value && value.version === 1 && 'games' in value && Array.isArray(value.games)) {
    return value.games as SavedGame[]
  }
  return []
}

export function loadSavedGames(): SavedGame[] {
  return storedGames(parseStoredValue(completedGamesKey)).toSorted((left, right) => right.playedAt.localeCompare(left.playedAt))
}

export function saveCompletedGame(game: SavedGame): void {
  const games = loadSavedGames().filter((saved) => saved.id !== game.id)
  const envelope: CompletedGamesEnvelope = { version: 1, games: [game, ...games] }
  localStorage.setItem(completedGamesKey, JSON.stringify(envelope))
  enqueueSyncOperation({
    id: `game:${game.id}`,
    kind: 'completed-game',
    payload: completedGameRecord(game),
    createdAt: new Date().toISOString(),
  })
}

export function deleteCompletedGame(gameId: string): void {
  const envelope: CompletedGamesEnvelope = { version: 1, games: loadSavedGames().filter(game => game.id !== gameId) }
  localStorage.setItem(completedGamesKey, JSON.stringify(envelope))
  enqueueSyncOperation({
    id: `game-tombstone:${gameId}`,
    kind: 'game-tombstone',
    payload: { collection: 'knightshift_games', clientId: gameId, deletedAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
  })
}

export function loadActiveGame(): ActiveGame | null {
  const stored = parseStoredValue(activeGameKey)
  if (!stored || typeof stored !== 'object' || !('version' in stored) || stored.version !== 1 || !('activeGame' in stored)) return null
  const activeGame = stored.activeGame
  if (!activeGame || typeof activeGame !== 'object' || !('game' in activeGame) || !('playerColor' in activeGame) || !('difficulty' in activeGame) || !('lastCapture' in activeGame)) return null
  if (activeGame.playerColor !== 'w' && activeGame.playerColor !== 'b') return null
  return activeGame as ActiveGame
}

export function saveActiveGame(activeGame: ActiveGame): void {
  const envelope: ActiveGameEnvelope = { version: 1, activeGame }
  localStorage.setItem(activeGameKey, JSON.stringify(envelope))
}

export function clearActiveGame(): void {
  localStorage.removeItem(activeGameKey)
}
