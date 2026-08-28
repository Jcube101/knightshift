export type GameTermination = 'checkmate' | 'stalemate' | 'draw' | 'resignation'

type CompletedGame = { result: '1-0' | '0-1' | '1/2-1/2'; termination: GameTermination }

export function describeGameResult(game: CompletedGame, playerColor: 'w' | 'b'): { title: string; detail: string } {
  if (game.termination === 'resignation') {
    return { title: 'You resigned.', detail: 'The game has been saved to your local database.' }
  }
  if (game.termination === 'stalemate') {
    return { title: 'Draw by stalemate.', detail: 'Neither side has a legal move. The game has been saved to your local database.' }
  }
  if (game.termination === 'draw') {
    return { title: 'Draw.', detail: 'The game is over and has been saved to your local database.' }
  }

  const playerWon = (game.result === '1-0' && playerColor === 'w') || (game.result === '0-1' && playerColor === 'b')
  return {
    title: playerWon ? 'Checkmate. You win.' : 'Checkmate. Stockfish wins.',
    detail: 'The game is over and has been saved to your local database.',
  }
}
