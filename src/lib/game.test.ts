import { describe, expect, it } from 'vitest'
import { applyEngineMove, beginGame, isPlayersPiece, isTerminalPosition, materialBalance, playMove, resignGame, undoLastTurn } from './game'

describe('playMove', () => {
  it('records resignation as a loss without changing the saved move history', () => {
    const game = beginGame()
    const result = resignGame(game, 'w')

    expect(result).toMatchObject({ accepted: true, result: '0-1', termination: 'resignation', history: [], uciHistory: [] })
  })

  it.each([
    ['White win', 'w', { fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1', history: [], uciHistory: [] }, { from: 'f7', to: 'g7' }],
    ['White loss', 'w', { fen: '8/8/8/8/8/5pqk/8/7K b - - 0 1', history: [], uciHistory: [] }, { from: 'g3', to: 'g2' }],
    ['Black win', 'b', { fen: '8/8/8/8/8/5pqk/8/7K b - - 0 1', history: [], uciHistory: [] }, { from: 'g3', to: 'g2' }],
    ['Black loss', 'b', { fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1', history: [], uciHistory: [] }, { from: 'f7', to: 'g7' }],
  ] as const)('recognises the terminal review position for a %s', (_scenario, playerColor, game, move) => {
    const result = playMove({ ...game, history: [...game.history], uciHistory: [...game.uciHistory] }, { ...move }, playerColor)
    if (!result.accepted) throw new Error('expected legal terminal fixture move')
    expect(isTerminalPosition({ fen: result.fen, history: result.history, uciHistory: result.uciHistory })).toBe(true)
  })

  it.each([
    ['stalemate', { fen: '7k/5K2/5Q2/8/8/8/8/8 w - - 0 1', history: [], uciHistory: [] }, { from: 'f6', to: 'g6' }],
    ['fifty-move draw', { fen: '7k/8/8/8/8/8/6R1/K7 w - - 99 1', history: [], uciHistory: [] }, { from: 'g2', to: 'g4' }],
  ] as const)('recognises a terminal %s after the player final move', (_outcome, game, move) => {
    const result = playMove({ ...game, history: [...game.history], uciHistory: [...game.uciHistory] }, { ...move })
    if (!result.accepted) throw new Error('expected legal terminal fixture move')
    expect(isTerminalPosition({ fen: result.fen, history: result.history, uciHistory: result.uciHistory })).toBe(true)
  })

  it('recognises a checkmating final position as terminal', () => {
    let game = beginGame()
    for (const [from, to] of [['e2', 'e4'], ['e7', 'e5'], ['d1', 'h5'], ['b8', 'c6'], ['f1', 'c4'], ['g8', 'f6'], ['h5', 'f7']] as const) {
      const result = playMove(game, { from, to })
      if (!result.accepted) throw new Error('expected legal fixture move')
      game = { fen: result.fen, history: result.history, uciHistory: result.uciHistory }
    }
    expect(isTerminalPosition(game)).toBe(true)
  })

  it('accepts a legal player move and records its UCI form for Stockfish', () => {
    const game = beginGame()

    const result = playMove(game, { from: 'e2', to: 'e4' })

    expect(result.accepted).toBe(true)
    if (!result.accepted) throw new Error('expected legal move to be accepted')
    expect(result.san).toBe('e4')
    expect(result.uciHistory).toEqual(['e2e4'])
  })

  it('applies Stockfish UCI output as the bot move', () => {
    const afterPlayerMove = playMove(beginGame(), { from: 'e2', to: 'e4' })
    if (!afterPlayerMove.accepted) throw new Error('expected legal move to be accepted')

    const result = applyEngineMove({ fen: afterPlayerMove.fen, history: afterPlayerMove.history, uciHistory: afterPlayerMove.uciHistory }, 'e7e5')

    expect(result).toMatchObject({ accepted: true, san: 'e5', uciHistory: ['e2e4', 'e7e5'] })
  })

  it('undoes a White player turn and its Stockfish reply', () => {
    const player = playMove(beginGame(), { from: 'e2', to: 'e4' })
    if (!player.accepted) throw new Error('expected legal move to be accepted')
    const engine = applyEngineMove({ fen: player.fen, history: player.history, uciHistory: player.uciHistory }, 'e7e5')
    if (!engine.accepted) throw new Error('expected legal engine move to be accepted')

    expect(undoLastTurn({ fen: engine.fen, history: engine.history, uciHistory: engine.uciHistory }, 'w')).toEqual(beginGame())
  })

  it('preserves Stockfish’s opening move when undoing as Black', () => {
    const opening = applyEngineMove(beginGame(), 'e2e4', 'w')
    if (!opening.accepted) throw new Error('expected legal opening move')
    const player = playMove({ fen: opening.fen, history: opening.history, uciHistory: opening.uciHistory }, { from: 'c7', to: 'c5' }, 'b')
    if (!player.accepted) throw new Error('expected legal Black move')
    const engine = applyEngineMove({ fen: player.fen, history: player.history, uciHistory: player.uciHistory }, 'g1f3', 'w')
    if (!engine.accepted) throw new Error('expected legal engine move')

    expect(undoLastTurn({ fen: engine.fen, history: engine.history, uciHistory: engine.uciHistory }, 'b')).toMatchObject({ history: ['e4'], uciHistory: ['e2e4'] })
  })

  it('waits for the engine instead of selecting a local heuristic reply', () => {
    const result = playMove(beginGame(), { from: 'd2', to: 'd3' })

    expect(result).toMatchObject({ accepted: true, history: ['d3'], uciHistory: ['d2d3'] })
  })

  it('reports the captured piece and player-relative material balance', () => {
    const game = { fen: '7k/8/8/4p3/3P4/8/8/K7 w - - 0 1', history: [], uciHistory: [] }

    const result = playMove(game, { from: 'd4', to: 'e5' })

    expect(result).toMatchObject({ accepted: true, captured: 'p' })
    expect(materialBalance({ fen: result.fen, history: result.history, uciHistory: result.uciHistory }, 'w')).toBe(1)
  })

  it('reports a player checkmate as a completed win', () => {
    const game = { fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1', history: [], uciHistory: [] }

    const result = playMove(game, { from: 'f7', to: 'g7' })

    expect(result).toMatchObject({ accepted: true, result: '1-0' })
  })

  it('rejects an illegal move without changing the position', () => {
    const game = beginGame()

    const result = playMove(game, { from: 'e2', to: 'e5' })

    expect(result.accepted).toBe(false)
    expect(result.fen).toBe(game.fen)
    expect(result.uciHistory).toEqual(game.uciHistory)
  })

  it('identifies player-owned pieces from the canonical game position', () => {
    const game = beginGame()

    expect(isPlayersPiece(game, 'd2', 'w')).toBe(true)
    expect(isPlayersPiece(game, 'd4', 'w')).toBe(false)
    expect(isPlayersPiece(game, 'd7', 'w')).toBe(false)
  })
})
