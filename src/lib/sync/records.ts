import type { CandidateMoment } from '../analysis'
import type { Defaults } from '../defaults'
import type { SavedGame } from '../storage'

export type CompletedGameRecord = {
  collection: 'knightshift_games'
  clientId: string
  playedAt: string
  payloadVersion: 1
  payload: SavedGame
}

export type ReviewCandidateRecord = {
  collection: 'knightshift_review_candidates'
  gameClientId: string
  moveIndex: number
  syncKey: string
  payloadVersion: 1
  payload: CandidateMoment
}

export type SettingsRecord = {
  collection: 'knightshift_settings'
  revision: number
  payloadVersion: 1
  payload: Defaults
}

export function completedGameRecord(game: SavedGame): CompletedGameRecord {
  if ('activeGame' in game) throw new Error('Active game checkpoints are device-local and cannot sync.')

  return {
    collection: 'knightshift_games',
    clientId: game.id,
    playedAt: game.playedAt,
    payloadVersion: 1,
    payload: game,
  }
}

export function reviewCandidateRecord(gameClientId: string, candidate: CandidateMoment): ReviewCandidateRecord {
  if (candidate.moveIndex === undefined) throw new Error('Review candidates require a move index.')

  return {
    collection: 'knightshift_review_candidates',
    gameClientId,
    moveIndex: candidate.moveIndex,
    syncKey: `${gameClientId}:${candidate.moveIndex}`,
    payloadVersion: 1,
    payload: candidate,
  }
}

export type LearnCustomizationRecord = {
  collection: 'knightshift_learn_customization'
  openingKey: string
  state: 'added' | 'hidden'
  revision: number
  payloadVersion: 1
}

export function learnCustomizationRecord(openingKey: string, state: 'saved' | 'hidden', revision: number): LearnCustomizationRecord {
  return { collection: 'knightshift_learn_customization', openingKey, state: state === 'saved' ? 'added' : 'hidden', revision, payloadVersion: 1 }
}

export function settingsRecord(payload: Defaults, revision: number): SettingsRecord {
  return { collection: 'knightshift_settings', revision, payloadVersion: 1, payload }
}
