import { Chess } from 'chess.js'
import { openingDatabaseA } from './openingDatabaseA'
import { openingDatabaseB } from './openingDatabaseB'
import { openingDatabaseC } from './openingDatabaseC'
import { openingDatabaseD } from './openingDatabaseD'
import { openingDatabaseE } from './openingDatabaseE'

const openingDatabase = [...openingDatabaseA, ...openingDatabaseB, ...openingDatabaseC, ...openingDatabaseD, ...openingDatabaseE]

export type OpeningClassification =
  | { status: 'identified'; eco: string; opening: string; variation?: string; matchedPly: number; continuation: 'within-line' | 'unclassified' }
  | { status: 'unidentified' }

function hasPrefix(history: string[], moves: string[]): boolean {
  return moves.length <= history.length && moves.every((move, index) => move === history[index])
}

function legalHistory(history: string[]): boolean {
  try {
    const board = new Chess()
    for (const move of history) board.move(move)
    return true
  } catch {
    return false
  }
}

export function classifyOpening(history: string[]): OpeningClassification {
  if (!history.length || !legalHistory(history)) return { status: 'unidentified' }
  const matches = openingDatabase.filter(line => hasPrefix(history, line.moves))
  if (!matches.length) return { status: 'unidentified' }

  const parent = matches.filter(line => !line.variation).toSorted((left, right) => right.moves.length - left.moves.length)[0]
  const named = matches.filter(line => line.variation && line.moves.length >= 6).toSorted((left, right) => right.moves.length - left.moves.length)[0]
  const selected = named ?? parent ?? matches.toSorted((left, right) => right.moves.length - left.moves.length)[0]
  const matchedPly = matches.toSorted((left, right) => right.moves.length - left.moves.length)[0].moves.length
  const withinLine = selected.moves.length === history.length
  return {
    status: 'identified', eco: selected.eco, opening: selected.opening,
    ...(named?.variation ? { variation: named.variation } : {}),
    matchedPly,
    continuation: withinLine ? 'within-line' : 'unclassified',
  }
}
