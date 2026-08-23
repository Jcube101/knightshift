import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useEffect, useMemo, useRef, useState } from 'react'
import { applyEngineMove, beginGame, playMove, type GameState } from './lib/game'
import { StockfishEngine } from './lib/engine'
import { saveCompletedGame } from './lib/storage'
import { resolveTap } from './lib/tapMove'
import './App.css'

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
  const [notice, setNotice] = useState('Stockfish is warming up. You play White.')
  const [thinking, setThinking] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const engineRef = useRef<StockfishEngine | null>(null)
  const position = useMemo(() => positionFor(game), [game])

  useEffect(() => {
    const engine = new StockfishEngine()
    engineRef.current = engine
    return () => engine.terminate()
  }, [])

  function resetGame() {
    setGame(beginGame())
    setThinking(false)
    setSelectedSquare(null)
    setNotice('Fresh board. You play White.')
  }

  function saveResult(result: Extract<ReturnType<typeof playMove>, { accepted: true }>) {
    if (!result.result) return false
    saveCompletedGame({
      id: crypto.randomUUID(),
      playedAt: new Date().toISOString(),
      result: result.result,
      moves: result.history,
    })
    setNotice(`Game complete: ${result.result}. Saved to your local database.`)
    return true
  }

  async function playTurn(sourceSquare: string, targetSquare: string): Promise<boolean> {
    if (thinking || !engineRef.current) return false

    const player = playMove(game, { from: sourceSquare, to: targetSquare, promotion: 'q' })
    if (!player.accepted) {
      setNotice('That move is not legal.')
      return false
    }

    setSelectedSquare(null)
    setGame({ fen: player.fen, history: player.history, uciHistory: player.uciHistory })
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
      const bot = applyEngineMove({ fen: player.fen, history: player.history, uciHistory: player.uciHistory }, engineMove)
      if (!bot.accepted) throw new Error(`Stockfish returned an illegal move: ${engineMove}`)

      setGame({ fen: bot.fen, history: bot.history, uciHistory: bot.uciHistory })
      if (!saveResult(bot)) setNotice(`Stockfish played ${bot.san}. Your move.`)
      return true
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Stockfish could not complete its move.')
      return false
    } finally {
      setThinking(false)
    }
  }

  function handleSquareTap(square: string, isWhitePiece: boolean) {
    if (thinking) return
    const { selected, move } = resolveTap(selectedSquare, square, isWhitePiece)
    setSelectedSquare(selected)
    if (!move) {
      setNotice(selected ? `Selected ${selected}. Choose a destination.` : 'Tap one of your white pieces to select it.')
      return
    }
    void playTurn(move.from, move.to)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">PERSONAL CHESS WORKSPACE</p>
          <h1>Knightshift</h1>
        </div>
        <button className="new-game" type="button" onClick={resetGame}>New game</button>
      </header>

      <section className="game-layout" aria-label="Play chess">
        <div className="board-wrap">
          <div className="engine-board" aria-label="Chess board">
            <Chessboard options={{
              id: 'knightshift-board',
              position,
              boardOrientation: 'white',
              canDragPiece: ({ piece }) => piece.pieceType.startsWith('w') && !thinking,
              onSquareClick: ({ piece, square }) => handleSquareTap(square, piece?.pieceType.startsWith('w') ?? false),
              onPieceDrop: ({ sourceSquare, targetSquare }) => {
                if (!sourceSquare || !targetSquare) return false
                void playTurn(sourceSquare, targetSquare)
                return true
              },
              showNotation: true,
              showAnimations: true,
              animationDurationInMs: 180,
              boardStyle: { borderRadius: '10px', boxShadow: '0 18px 45px #0008' },
              darkSquareStyle: { backgroundColor: '#769867' },
              lightSquareStyle: { backgroundColor: '#dce6cb' },
            }} />
          </div>
          <p className="board-status" role="status">{notice}</p>
        </div>

        <aside className="side-panel">
          <section className="panel-card">
            <p className="section-label">CURRENT GAME</p>
            <h2>{thinking ? 'Stockfish is thinking' : 'Play against Stockfish'}</h2>
            <label htmlFor="difficulty">Engine difficulty</label>
            <select disabled={thinking} id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option>Casual</option>
              <option>Steady</option>
              <option>Sharp</option>
            </select>
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
