import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { applyEngineMove, beginGame, isPlayersPiece, materialBalance, playMove, type GameState } from './lib/game'
import { StockfishEngine } from './lib/engine'
import { saveCompletedGame } from './lib/storage'
import { resolveTap } from './lib/tapMove'
import { describeGameResult } from './lib/resultMessage'
import { createTapGuard } from './lib/tapGuard'
import { readTheme, saveTheme, themeOptions, themes, type ThemeId } from './lib/theme'
import './App.css'

const pieceLabels = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen' } as const
const piecePoints = { p: 1, n: 3, b: 3, r: 5, q: 9 } as const

const skillLevels: Record<string, { skillLevel: number; nodes: number }> = {
  Casual: { skillLevel: 3, nodes: 2_000 },
  Steady: { skillLevel: 8, nodes: 8_000 },
  Sharp: { skillLevel: 14, nodes: 25_000 },
}

function positionFor(game: GameState): string {
  const chess = new Chess(game.fen)
  for (const move of game.history) chess.move(move)
  return chess.fen()
}

function App() {
  const [game, setGame] = useState<GameState>(beginGame)
  const [difficulty, setDifficulty] = useState('Steady')
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w')
  const [notice, setNotice] = useState('Stockfish is warming up. You play White.')
  const [thinking, setThinking] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [completedResult, setCompletedResult] = useState<Extract<ReturnType<typeof playMove>, { accepted: true }> | null>(null)
  const [lastCapture, setLastCapture] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeId>(readTheme)
  const engineRef = useRef<StockfishEngine | null>(null)
  const tapGuardRef = useRef(createTapGuard(250))
  const position = useMemo(() => positionFor(game), [game])
  const material = useMemo(() => materialBalance(game, playerColor), [game, playerColor])
  const palette = themes[theme]
  const themeStyle = {
    '--theme-background': palette.background, '--theme-glow': palette.glow, '--theme-panel': palette.panel, '--theme-muted-panel': palette.mutedPanel, '--theme-border': palette.border, '--theme-text': palette.text, '--theme-soft-text': palette.softText, '--theme-eyebrow': palette.eyebrow, '--theme-action': palette.action, '--theme-action-text': palette.actionText,
  } as CSSProperties

  useEffect(() => {
    const engine = new StockfishEngine()
    engineRef.current = engine
    return () => engine.terminate()
  }, [])

  async function startBlackGame(freshGame: GameState) {
    if (!engineRef.current) {
      setNotice('Stockfish is still warming up. Try Black again in a moment.')
      return
    }
    setThinking(true)
    setNotice('Stockfish is opening as White…')
    try {
      const engineMove = await engineRef.current.bestMove({ fen: freshGame.fen, moves: [], ...skillLevels[difficulty] })
      const opening = applyEngineMove(freshGame, engineMove, 'w')
      if (!opening.accepted) throw new Error(`Stockfish returned an illegal opening move: ${engineMove}`)
      setGame({ fen: opening.fen, history: opening.history, uciHistory: opening.uciHistory })
      setNotice(`Stockfish played ${opening.san}. Your move as Black.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Stockfish could not start the game.')
    } finally {
      setThinking(false)
    }
  }

  function chooseSide(color: 'w' | 'b') {
    const freshGame = beginGame()
    setPlayerColor(color)
    setGame(freshGame)
    setThinking(false)
    setSelectedSquare(null)
    setCompletedResult(null)
    setLastCapture(null)
    setNotice(color === 'w' ? 'Fresh board. You play White.' : 'Preparing Stockfish’s White opening…')
    if (color === 'b') void startBlackGame(freshGame)
  }

  function chooseTheme(nextTheme: ThemeId) {
    setTheme(nextTheme)
    saveTheme(nextTheme)
  }

  function resetGame() {
    chooseSide(playerColor)
  }

  function recordCapture(captured: keyof typeof piecePoints | null, actor: 'You' | 'Stockfish') {
    if (!captured) return
    setLastCapture(`${actor} captured a ${pieceLabels[captured]}, +${piecePoints[captured]}`)
  }

  function saveResult(result: Extract<ReturnType<typeof playMove>, { accepted: true }>) {
    if (!result.result) return false
    saveCompletedGame({
      id: crypto.randomUUID(),
      playedAt: new Date().toISOString(),
      result: result.result,
      moves: result.history,
    })
    setCompletedResult(result)
    setNotice(`Game complete: ${result.result}. Saved to your local database.`)
    return true
  }

  async function playTurn(sourceSquare: string, targetSquare: string): Promise<boolean> {
    if (thinking || !engineRef.current) return false

    const player = playMove(game, { from: sourceSquare, to: targetSquare, promotion: 'q' }, playerColor)
    if (!player.accepted) {
      setNotice('That move is not legal.')
      return false
    }

    setSelectedSquare(null)
    setGame({ fen: player.fen, history: player.history, uciHistory: player.uciHistory })
    if (player.captured && player.captured !== 'k') recordCapture(player.captured, 'You')
    if (saveResult(player)) return true

    setThinking(true)
    setNotice('Stockfish is calculating…')
    try {
      const settings = skillLevels[difficulty]
      const engineMove = await engineRef.current.bestMove({
        fen: game.fen,
        moves: player.uciHistory,
        ...settings,
      })
      const bot = applyEngineMove({ fen: player.fen, history: player.history, uciHistory: player.uciHistory }, engineMove, playerColor === 'w' ? 'b' : 'w')
      if (!bot.accepted) throw new Error(`Stockfish returned an illegal move: ${engineMove}`)

      setGame({ fen: bot.fen, history: bot.history, uciHistory: bot.uciHistory })
      if (bot.captured && bot.captured !== 'k') recordCapture(bot.captured, 'Stockfish')
      if (!saveResult(bot)) setNotice(`Stockfish played ${bot.san}. Your move.`)
      return true
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Stockfish could not complete its move.')
      return false
    } finally {
      setThinking(false)
    }
  }

  function handleSquareTap(square: string) {
    if (tapGuardRef.current.consumeIfSuppressed(Date.now())) return
    if (thinking) return
    const isWhitePiece = isPlayersPiece(game, square, playerColor)
    const { selected, move } = resolveTap(selectedSquare, square, isWhitePiece)
    setSelectedSquare(selected)
    if (!move) {
      setNotice(selected ? `Selected ${selected}. Choose a destination.` : 'Tap one of your white pieces to select it.')
      return
    }
    void playTurn(move.from, move.to)
  }

  return (
    <main className="app-shell" data-theme={theme} style={themeStyle}>
      <header className="topbar">
        <div>
          <p className="eyebrow">PERSONAL CHESS WORKSPACE</p>
          <h1>Knightshift</h1>
        </div>
        <button className="new-game" type="button" onClick={resetGame}>New game</button>
      </header>

      {completedResult?.result && completedResult.termination && (() => {
        const message = describeGameResult({ result: completedResult.result, termination: completedResult.termination }, playerColor)
        return (
          <section className="game-result" role="alert" aria-live="assertive">
            <div>
              <p className="section-label">GAME COMPLETE</p>
              <h2>{message.title}</h2>
              <p>{message.detail}</p>
            </div>
            <button className="new-game" type="button" onClick={resetGame}>Play again</button>
          </section>
        )
      })()}

      <section className="game-layout" aria-label="Play chess">
        <div className="board-wrap">
          <div className="engine-board" aria-label="Chess board">
            <Chessboard options={{
              id: 'knightshift-board',
              position,
              boardOrientation: playerColor === 'w' ? 'white' : 'black',
              canDragPiece: ({ piece }) => piece.pieceType.startsWith(playerColor) && !thinking,
              onSquareClick: ({ square }) => handleSquareTap(square),
              onPieceDrop: ({ sourceSquare, targetSquare }) => {
                if (!sourceSquare || !targetSquare) return false
                tapGuardRef.current.recordDrop(Date.now())
                void playTurn(sourceSquare, targetSquare)
                return true
              },
              showNotation: true,
              showAnimations: true,
              animationDurationInMs: 180,
              boardStyle: { borderRadius: '10px', boxShadow: `0 18px 45px ${palette.shadow}` },
              darkSquareStyle: { backgroundColor: palette.boardDark },
              lightSquareStyle: { backgroundColor: palette.boardLight },
            }} />
          </div>
          <p className="board-status" role="status">{notice}</p>
        </div>

        <aside className="side-panel">
          <section className="panel-card">
            <p className="section-label">CURRENT GAME</p>
            <h2>{thinking ? 'Stockfish is thinking' : 'Play against Stockfish'}</h2>
            <label htmlFor="side">Play as</label>
            <select disabled={thinking} id="side" value={playerColor} onChange={(event) => chooseSide(event.target.value as 'w' | 'b')}>
              <option value="w">White</option>
              <option value="b">Black</option>
            </select>
            <label htmlFor="difficulty">Engine difficulty</label>
            <select disabled={thinking} id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option>Casual</option>
              <option>Steady</option>
              <option>Sharp</option>
            </select>
            <label htmlFor="theme">Theme</label>
            <select id="theme" value={theme} onChange={(event) => chooseTheme(event.target.value as ThemeId)}>
              {themeOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <p className="material-balance">Material: <strong>{material > 0 ? `+${material}` : material === 0 ? 'Even' : material}</strong></p>
            {lastCapture && <p className="capture-note" aria-live="polite">{lastCapture}</p>}
            <div className="move-log" aria-label="Move history">
              {game.history.length === 0 ? <p>Moves will appear here.</p> : game.history.map((move, index) => <span key={`${move}-${index}`}>{index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ${move}` : move}</span>)}
            </div>
          </section>

          <section className="panel-card muted-card">
            <p className="section-label">ENGINE</p>
            <h2>Stockfish 18 Lite</h2>
            <p>Runs in your browser. Full move analysis and blunder detection are next.</p>
          </section>
        </aside>
      </section>
    </main>
  )
}

export default App
