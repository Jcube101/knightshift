import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { Link, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { applyEngineMove, beginGame, canUndoLastTurn, isPlayersPiece, isTerminalPosition, materialBalance, playMove, resignGame, undoLastTurn, type GameState } from '../lib/game'
import { StockfishEngine } from '../lib/engine'
import { readDefaults } from '../lib/defaults'
import { clearActiveGame, loadActiveGame, loadSavedGames, saveActiveGame, saveCompletedGame, type SavedGame } from '../lib/storage'
import { resolveTap } from '../lib/tapMove'
import { positionBeforeMove, selectCriticalMoments, type CriticalMoment } from '../lib/analysis'
import { classifyOpening } from '../lib/openingClassification'
import { summarizeInsights } from '../lib/insights'
import { describeGameResult } from '../lib/resultMessage'
import { createTapGuard } from '../lib/tapGuard'
import { latestMoveScrollLeft } from '../lib/moveLogScroll'
import { loadReviewJob, normalizeReviewJob, saveReviewJob } from '../lib/reviewJob'
import { readTheme, themes, type ThemeId } from '../lib/theme'
import '../App.css'

const pieceLabels = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen' } as const
const piecePoints = { p: 1, n: 3, b: 3, r: 5, q: 9 } as const

const difficultyOptions = ['Casual', 'Steady', 'Sharp'] as const

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

function gameForReview(savedGame: SavedGame): GameState {
  const chess = new Chess()
  const uciHistory = savedGame.moves.map(move => {
    const played = chess.move(move)
    return `${played.from}${played.to}${played.promotion ?? ''}`
  })
  return { fen: new Chess().fen(), history: savedGame.moves, uciHistory }
}

function PlayScreen() {
  const [searchParams] = useSearchParams()
  const reviewGameId = searchParams.get('review')
  const reviewGame = reviewGameId ? loadSavedGames().find(saved => saved.id === reviewGameId) ?? null : null
  const [restoredActiveGame] = useState(loadActiveGame)
  const [newGameDefaults] = useState(readDefaults)
  const [game, setGame] = useState<GameState>(() => reviewGame ? gameForReview(reviewGame) : restoredActiveGame?.game ?? beginGame())
  const [difficulty, setDifficulty] = useState(() => reviewGame?.difficulty ?? restoredActiveGame?.difficulty ?? newGameDefaults.difficulty)
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>(() => reviewGame?.playerColor ?? restoredActiveGame?.playerColor ?? newGameDefaults.side)
  const [notice, setNotice] = useState(() => restoredActiveGame ? 'Restored your active game. Your move.' : newGameDefaults.side === 'b' ? 'Preparing Stockfish’s White opening…' : 'Stockfish is warming up. You play White.')
  const [thinking, setThinking] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [completedResult, setCompletedResult] = useState<Extract<ReturnType<typeof playMove>, { accepted: true }> | null>(null)
  const [lastCapture, setLastCapture] = useState<string | null>(() => restoredActiveGame?.lastCapture ?? null)
  const [theme] = useState<ThemeId>(readTheme)
  const [analysis, setAnalysis] = useState<CriticalMoment[] | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<{ completed: number; total: number } | null>(null)
  const [selectedMoment, setSelectedMoment] = useState<CriticalMoment | null>(null)
  const [reviewColor, setReviewColor] = useState<'w' | 'b'>(() => restoredActiveGame?.playerColor ?? 'w')
  const [reviewId, setReviewId] = useState<string | null>(reviewGame?.id ?? null)
  const [savedGames, setSavedGames] = useState<SavedGame[]>(loadSavedGames)
  const engineRef = useRef<StockfishEngine | null>(null)
  const savedGameRef = useRef<SavedGame | null>(reviewGame)
  const tapGuardRef = useRef(createTapGuard(250))
  const moveLogRef = useRef<HTMLDivElement | null>(null)
  const initialBlackEngineRef = useRef<StockfishEngine | null>(null)
  const position = useMemo(() => positionFor(game), [game])
  const material = useMemo(() => materialBalance(game, playerColor), [game, playerColor])
  const insights = useMemo(() => summarizeInsights(savedGames.filter((savedGame) => savedGame.analysisVersion === 1 && savedGame.analysis)), [savedGames])
  const canUndo = !thinking && !completedResult && canUndoLastTurn(game, playerColor)
  const palette = themes[theme]
  void insights
  void analysis
  void selectedMoment
  void reviewColor
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

  useEffect(() => {
    const moveLog = moveLogRef.current
    if (moveLog) moveLog.scrollLeft = latestMoveScrollLeft(moveLog)
  }, [game.history])

  const startBlackGame = useCallback(async (freshGame: GameState, isCancelled: () => boolean = () => false) => {
    if (!engineRef.current) {
      setNotice('Stockfish is still warming up. Try Black again in a moment.')
      return
    }
    setThinking(true)
    setNotice('Stockfish is opening as White…')
    try {
      const engineMove = await engineRef.current.bestMove({ fen: freshGame.fen, moves: [], ...skillLevels[difficulty] })
      if (isCancelled()) return
      const opening = applyEngineMove(freshGame, engineMove, 'w')
      if (!opening.accepted) throw new Error(`Stockfish returned an illegal opening move: ${engineMove}`)
      setGame({ fen: opening.fen, history: opening.history, uciHistory: opening.uciHistory })
      setNotice(`Stockfish played ${opening.san}. Your move as Black.`)
    } catch (error) {
      if (!isCancelled()) setNotice(error instanceof Error ? error.message : 'Stockfish could not start the game.')
    } finally {
      if (!isCancelled()) setThinking(false)
    }
  }, [difficulty])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine || restoredActiveGame || playerColor !== 'b' || initialBlackEngineRef.current === engine) return
    initialBlackEngineRef.current = engine
    let cancelled = false
    void startBlackGame(game, () => cancelled)
    return () => {
      cancelled = true
    }
  }, [game, playerColor, restoredActiveGame, startBlackGame])

  function chooseSide(color: 'w' | 'b') {
    const freshGame = beginGame()
    clearActiveGame()
    setPlayerColor(color)
    setReviewColor(color)
    setGame(freshGame)
    setThinking(false)
    setSelectedSquare(null)
    setCompletedResult(null)
    setAnalysis(null)
    setSelectedMoment(null)
    savedGameRef.current = null
    setReviewId(null)
    setAnalysing(false)
    setLastCapture(null)
    setNotice(color === 'w' ? 'Fresh board. You play White.' : 'Preparing Stockfish’s White opening…')
    if (color === 'b') void startBlackGame(freshGame)
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

  function resignCurrentGame() {
    if (thinking || completedResult || reviewGame) return
    if (!window.confirm('Resign this game?')) return
    saveResult(resignGame(game, playerColor))
  }

  function recordCapture(captured: keyof typeof piecePoints | null, actor: 'You' | 'Stockfish') {
    if (!captured) return
    setLastCapture(`${actor} captured a ${pieceLabels[captured]}, +${piecePoints[captured]}`)
  }

  function saveResult(result: Extract<ReturnType<typeof playMove>, { accepted: true }>) {
    if (!result.result) return false
    clearActiveGame()
    const savedGame: SavedGame = {
      id: crypto.randomUUID(),
      playedAt: new Date().toISOString(),
      result: result.result,
      moves: result.history,
      playerColor,
      difficulty,
      opening: classifyOpening(result.history),
      termination: result.termination ?? undefined,
    }
    saveCompletedGame(savedGame)
    savedGameRef.current = savedGame
    setReviewId(savedGame.id)
    setSavedGames(loadSavedGames())
    setCompletedResult(result)
    setNotice(`Game complete: ${result.result}. Saved to your local database.`)
    return true
  }

  async function analyseGame() {
    const savedGame = savedGameRef.current
    if (!engineRef.current || analysing || !savedGame) return
    setAnalysing(true)
    const existing = loadReviewJob(savedGame.id)
    const normalized = existing ? normalizeReviewJob(existing, playerColor) : null
    const start = normalized?.nextMoveIndex ?? (playerColor === 'w' ? 0 : 1)
    const candidates = normalized?.candidates ?? []
    const totalPlayerMoves = Math.ceil((game.history.length - (playerColor === 'w' ? 0 : 1)) / 2)
    setAnalysisProgress({ completed: candidates.length, total: totalPlayerMoves })
    setNotice(`Reviewing your moves, ${Math.floor(candidates.length / 1) + 1} of ${totalPlayerMoves}`)
    try {
      for (let index = start; index < game.history.length; index += 2) {
        const before = await engineRef.current.analyse({ fen: game.fen, moves: game.uciHistory.slice(0, index), skillLevel: 12, nodes: 1_500 })
        const afterGame = { fen: game.fen, history: game.history.slice(0, index + 1), uciHistory: game.uciHistory.slice(0, index + 1) }
        const after = isTerminalPosition(afterGame) ? { centipawns: 0, bestMove: undefined } : await engineRef.current.analyse({ fen: game.fen, moves: game.uciHistory.slice(0, index + 1), skillLevel: 12, nodes: 1_500 })
        candidates.push({ moveNumber: Math.floor(index / 2) + 1, moveIndex: index, beforeFen: positionBeforeMove(game.fen, game.history, index), afterFen: positionBeforeMove(game.fen, game.history, index + 1), played: game.history[index], playedUci: game.uciHistory[index], replyUci: after.bestMove ?? undefined, best: before.bestMove ?? 'No continuation available', loss: Math.max(0, before.centipawns + after.centipawns) })
        saveReviewJob({ gameId: savedGame.id, totalPlayerMoves, nextMoveIndex: index + 2, candidates, status: 'paused' })
        setAnalysisProgress({ completed: candidates.length, total: totalPlayerMoves })
        setNotice(`Reviewing your moves, ${candidates.length} of ${totalPlayerMoves}`)
      }
      const moments = selectCriticalMoments(candidates)
      const analysedGame = { ...savedGame, analysis: moments, analysisVersion: 1 as const }
      setAnalysis(moments)
      setSelectedMoment(moments.find((moment) => moment.rank === 1) ?? null)
      setReviewColor(playerColor)
      saveCompletedGame(analysedGame); savedGameRef.current = analysedGame; saveReviewJob({ gameId: savedGame.id, totalPlayerMoves, nextMoveIndex: game.history.length, candidates, status: 'complete' }); setSavedGames(loadSavedGames()); setNotice('Post-game review ready.')
    } catch (error) { saveReviewJob({ gameId: savedGame.id, totalPlayerMoves, nextMoveIndex: start, candidates, status: 'failed' }); setNotice(error instanceof Error ? `${error.message} Return to resume review.` : 'Review paused. Return to resume review.') } finally { setAnalysing(false) }
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
          <p className="eyebrow">YOUR CHESS STUDY</p>
          <h1><Link to="/">Knightshift</Link></h1>
        </div>
        <div className="game-actions">
          <button className="undo-game" disabled={!canUndo} type="button" onClick={undoTurn}>Undo last turn</button>
          <button className="resign-game" disabled={thinking || Boolean(completedResult) || Boolean(reviewGame)} type="button" onClick={resignCurrentGame}>Resign game</button>
          <button className="new-game" type="button" onClick={resetGame}>New game</button>
        </div>
      </header>

      {reviewGame && !reviewGame.analysis && <section className="game-result"><div><p className="section-label">POST-GAME REVIEW</p><h2>Resume your saved review</h2><p>{loadReviewJob(reviewGame.id)?.candidates.length ?? 0} of {loadReviewJob(reviewGame.id)?.totalPlayerMoves ?? 0} moves saved.</p></div><button className="new-game" disabled={analysing} type="button" onClick={() => void analyseGame()}>{analysing ? 'Analyzing…' : 'Resume review'}</button></section>}
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
              {analysis && reviewId ? <Link className="new-game" to={`/review/${reviewId}`}>Open review</Link> : <button className="undo-game" disabled={analysing} type="button" onClick={() => void analyseGame()}>{analysing ? `Analyzing ${analysisProgress?.completed ?? 0} of ${analysisProgress?.total ?? 0} moves` : 'Analyze game'}</button>}
              <button className="new-game" type="button" onClick={resetGame}>Play again</button>
            </div>
          </section>
        )
      })()}

      <section className="game-layout" aria-label="Play chess">
        <div className="board-wrap">
          <div className="board-context">
            <p className="material-balance">Material <strong>{material > 0 ? `+${material}` : material === 0 ? 'Even' : material}</strong></p>
            <div className="move-log" aria-label="Move history" ref={moveLogRef}>
              {game.history.length === 0 ? <span>Moves will appear here.</span> : game.history.map((move, index) => <span key={`${move}-${index}`}>{index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ${move}` : move}</span>)}
            </div>
          </div>
          <div className="engine-board" aria-label="Chess board">
            <Chessboard options={{
              id: 'knightshift-board', position, boardOrientation: playerColor === 'w' ? 'white' : 'black', canDragPiece: ({ piece }) => piece.pieceType.startsWith(playerColor) && !thinking, onSquareClick: ({ square }) => handleSquareTap(square), onPieceDrop: ({ sourceSquare, targetSquare }) => { if (!sourceSquare || !targetSquare) return false; tapGuardRef.current.recordDrop(Date.now()); void playTurn(sourceSquare, targetSquare); return true }, showNotation: true, showAnimations: true, animationDurationInMs: 180, boardStyle: { borderRadius: '10px', boxShadow: `0 18px 45px ${palette.shadow}` }, darkSquareStyle: { backgroundColor: palette.boardDark }, lightSquareStyle: { backgroundColor: palette.boardLight },
            }} />
          </div>
          <p className="board-status" role="status">{notice}</p>
          {lastCapture && <p className="capture-note" aria-live="polite">{lastCapture}</p>}
        </div>

        <aside className="side-panel play-controls">
          <fieldset disabled={thinking} aria-label="Play as" className="side-toggle">
            <legend>Play as</legend>
            <button className={playerColor === 'w' ? 'selected' : ''} type="button" onClick={() => chooseSide('w')}>White</button>
            <button className={playerColor === 'b' ? 'selected' : ''} type="button" onClick={() => chooseSide('b')}>Black</button>
          </fieldset>
          <label className="difficulty-control" htmlFor="difficulty">Engine difficulty <strong>{difficulty}</strong><input disabled={thinking} id="difficulty" type="range" min="0" max="2" step="1" value={difficultyOptions.indexOf(difficulty as typeof difficultyOptions[number])} onChange={(event) => setDifficulty(difficultyOptions[Number(event.target.value)])} /><span><em>Casual</em><em>Steady</em><em>Sharp</em></span></label>
        </aside>
      </section>
    </main>
  )
}

export default PlayScreen
