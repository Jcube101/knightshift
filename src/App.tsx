import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { applyEngineMove, beginGame, canUndoLastTurn, isPlayersPiece, materialBalance, playMove, undoLastTurn, type GameState } from './lib/game'
import { StockfishEngine } from './lib/engine'
import { clearActiveGame, loadActiveGame, saveActiveGame, saveCompletedGame } from './lib/storage'
import { resolveTap } from './lib/tapMove'
import { positionBeforeMove, selectCriticalMoments, type CriticalMoment } from './lib/analysis'
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

function reviewSquareStyles(moment: CriticalMoment): Record<string, CSSProperties> {
  const styles: Record<string, CSSProperties> = {}
  const highlight = (move: string | undefined, color: string) => {
    if (!move || !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) return
    styles[move.slice(0, 2)] = { backgroundColor: color }
    styles[move.slice(2, 4)] = { backgroundColor: color }
  }
  highlight(moment.playedUci, 'rgba(220, 70, 70, .55)')
  highlight(moment.best, 'rgba(65, 175, 115, .55)')
  return styles
}

function App() {
  const [restoredActiveGame] = useState(loadActiveGame)
  const [game, setGame] = useState<GameState>(() => restoredActiveGame?.game ?? beginGame())
  const [difficulty, setDifficulty] = useState(() => restoredActiveGame?.difficulty ?? 'Steady')
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>(() => restoredActiveGame?.playerColor ?? 'w')
  const [notice, setNotice] = useState(() => restoredActiveGame ? 'Restored your active game. Your move.' : 'Stockfish is warming up. You play White.')
  const [thinking, setThinking] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [completedResult, setCompletedResult] = useState<Extract<ReturnType<typeof playMove>, { accepted: true }> | null>(null)
  const [lastCapture, setLastCapture] = useState<string | null>(() => restoredActiveGame?.lastCapture ?? null)
  const [theme, setTheme] = useState<ThemeId>(readTheme)
  const [analysis, setAnalysis] = useState<CriticalMoment[] | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [selectedMoment, setSelectedMoment] = useState<CriticalMoment | null>(null)
  const engineRef = useRef<StockfishEngine | null>(null)
  const tapGuardRef = useRef(createTapGuard(250))
  const position = useMemo(() => positionFor(game), [game])
  const material = useMemo(() => materialBalance(game, playerColor), [game, playerColor])
  const canUndo = !thinking && !completedResult && canUndoLastTurn(game, playerColor)
  const palette = themes[theme]
  const themeStyle = {
    '--theme-background': palette.background, '--theme-glow': palette.glow, '--theme-panel': palette.panel, '--theme-muted-panel': palette.mutedPanel, '--theme-border': palette.border, '--theme-text': palette.text, '--theme-soft-text': palette.softText, '--theme-eyebrow': palette.eyebrow, '--theme-action': palette.action, '--theme-action-text': palette.actionText,
  } as CSSProperties

  useEffect(() => {
    const engine = new StockfishEngine()
    engineRef.current = engine
    return () => engine.terminate()
  }, [])

  useEffect(() => {
    if (thinking || completedResult) return
    saveActiveGame({ game, playerColor, difficulty, lastCapture })
  }, [completedResult, difficulty, game, lastCapture, playerColor, thinking])

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
    clearActiveGame()
    setPlayerColor(color)
    setGame(freshGame)
    setThinking(false)
    setSelectedSquare(null)
    setCompletedResult(null)
    setAnalysis(null)
    setSelectedMoment(null)
    setAnalysing(false)
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

  function undoTurn() {
    const previousGame = undoLastTurn(game, playerColor)
    if (!previousGame) return
    setGame(previousGame)
    setSelectedSquare(null)
    setLastCapture(null)
    setNotice('Undid your last turn. Your move.')
  }

  function recordCapture(captured: keyof typeof piecePoints | null, actor: 'You' | 'Stockfish') {
    if (!captured) return
    setLastCapture(`${actor} captured a ${pieceLabels[captured]}, +${piecePoints[captured]}`)
  }

  function saveResult(result: Extract<ReturnType<typeof playMove>, { accepted: true }>) {
    if (!result.result) return false
    clearActiveGame()
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

  async function analyseGame() {
    if (!engineRef.current || analysing) return
    setAnalysing(true)
    setNotice('Stockfish is reviewing your critical moments…')
    try {
      const candidates = []
      for (let index = playerColor === 'w' ? 0 : 1; index < game.history.length; index += 2) {
        const before = await engineRef.current.analyse({ fen: game.fen, moves: game.uciHistory.slice(0, index), skillLevel: 12, nodes: 1_500 })
        const after = await engineRef.current.analyse({ fen: game.fen, moves: game.uciHistory.slice(0, index + 1), skillLevel: 12, nodes: 1_500 })
        candidates.push({ moveNumber: Math.floor(index / 2) + 1, moveIndex: index, beforeFen: positionBeforeMove(game.fen, game.history, index), played: game.history[index], playedUci: game.uciHistory[index], best: before.bestMove ?? 'No continuation available', loss: Math.max(0, before.centipawns + after.centipawns) })
      }
      const moments = selectCriticalMoments(candidates)
      setAnalysis(moments)
      setSelectedMoment(moments[0] ?? null)
      setNotice('Post-game review complete.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Stockfish could not complete the review.')
    } finally {
      setAnalysing(false)
    }
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
        <div className="game-actions">
          <button className="undo-game" disabled={!canUndo} type="button" onClick={undoTurn}>Undo last turn</button>
          <button className="new-game" type="button" onClick={resetGame}>New game</button>
        </div>
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
            <div className="game-actions">
              <button className="undo-game" disabled={analysing} type="button" onClick={() => void analyseGame()}>{analysing ? 'Analyzing…' : 'Analyze game'}</button>
              <button className="new-game" type="button" onClick={resetGame}>Play again</button>
            </div>
          </section>
        )
      })()}

      {analysis && <section className="analysis-card" aria-live="polite">
        <p className="section-label">POST-GAME REVIEW</p>
        <h2>{analysis.length ? 'Your critical moments' : 'No major mistakes found'}</h2>
        {analysis.length ? <>
          <div className="moment-picker">
            {analysis.map((moment) => <button className={selectedMoment === moment ? 'moment-button selected' : 'moment-button'} key={`${moment.moveNumber}-${moment.played}`} onClick={() => setSelectedMoment(moment)} type="button">Move {moment.moveNumber}: {moment.played}</button>)}
          </div>
          {selectedMoment?.beforeFen && <div className="review-detail">
            <div className="review-board"><Chessboard options={{ id: 'analysis-board', position: selectedMoment.beforeFen, boardOrientation: playerColor === 'w' ? 'white' : 'black', showNotation: true, squareStyles: reviewSquareStyles(selectedMoment) }} /></div>
            <div><p className="section-label">MOVE {selectedMoment.moveNumber}</p><h3>You played {selectedMoment.played}</h3><p className="review-copy">Red shows your move. Green shows Stockfish’s alternative: <strong>{selectedMoment.best}</strong>.</p><p className="review-copy">{selectedMoment.explanation}</p><p className="takeaway"><strong>Takeaway:</strong> Before committing, compare your move with checks, captures, and threats for both sides.</p></div>
          </div>}
        </> : <p>Stockfish found no player moves with a meaningful evaluation drop at this review depth.</p>}
      </section>}

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
