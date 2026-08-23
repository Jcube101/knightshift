export type SavedGame = {
  id: string
  playedAt: string
  result: '1-0' | '0-1' | '1/2-1/2'
  moves: string[]
}

const storageKey = 'knightshift.completed-games'

export function loadSavedGames(): SavedGame[] {
  const saved = localStorage.getItem(storageKey)
  if (!saved) return []

  try {
    const games = JSON.parse(saved) as SavedGame[]
    return games.toSorted((left, right) => right.playedAt.localeCompare(left.playedAt))
  } catch {
    return []
  }
}

export function saveCompletedGame(game: SavedGame): void {
  const games = loadSavedGames().filter((saved) => saved.id !== game.id)
  localStorage.setItem(storageKey, JSON.stringify([game, ...games]))
}
