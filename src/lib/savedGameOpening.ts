import { classifyOpening, type OpeningClassification } from './openingClassification'
import type { SavedGame } from './storage'

export function openingForSavedGame(game: SavedGame): OpeningClassification {
  return game.opening ?? classifyOpening(game.moves)
}

export function openingLabel(opening: OpeningClassification): string {
  if (opening.status === 'unidentified') return 'Opening not identified'
  return opening.variation ? `${opening.opening} · ${opening.variation}` : opening.opening
}
