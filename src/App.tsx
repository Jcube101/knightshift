import { Chess } from 'chess.js'
import { useMemo, useState } from 'react'
import { beginGame, playMove, type GameState } from './lib/game'
import { saveCompletedGame } from './lib/storage'
import { boardGridStyle } from './lib/boardLayout'
import './App.css'

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
const pieces: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
}

function boardFor(game: GameState) {
  const chess = new Chess(game.fen)
  for (const move of game.history) chess.move(move)
  return chess.board()
}

function App() {
  const [game, setGame] = useState<GameState>(beginGame)
  const [selected, setSelected] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState('Steady')
  const [notice, setNotice] = useState('Your move. Choose a piece to begin.')
  const board = useMemo(() => boardFor(game), [game])

  function resetGame() {
    setGame(beginGame())
    setSelected(null)
    setNotice('Fresh board. You play White.')
  }

  function chooseSquare(square: string) {
    if (!selected) {
      setSelected(square)
      setNotice(`Selected ${square}. Choose a destination.`)
      return
    }

    const result = playMove(game, { from: selected, to: square, promotion: 'q' })
    setSelected(null)
    if (!result.accepted) {
      setNotice('That move is not legal. Select a piece and try again.')
      return
    }

    setGame({ fen: game.fen, history: result.history })
    if (result.result) {
      saveCompletedGame({
        id: crypto.randomUUID(),
        playedAt: new Date().toISOString(),
        result: result.result,
        moves: result.history,
      })
      setNotice(`${result.san}. Game complete: ${result.result}. Saved to your local database.`)
      return
    }
    setNotice(`${result.san}. Bot replied ${result.botMove}.`)
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
          <div className="board" style={boardGridStyle} aria-label="Chess board" role="grid">
            {board.flatMap((rank, rankIndex) => rank.map((piece, fileIndex) => {
              const square = `${files[fileIndex]}${ranks[rankIndex]}`
              const occupied = piece ? pieces[`${piece.color}${piece.type.toUpperCase()}`] : ''
              return (
                <button
                  aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
                  className={`square ${(rankIndex + fileIndex) % 2 === 0 ? 'light' : 'dark'} ${selected === square ? 'selected' : ''}`}
                  key={square}
                  onClick={() => chooseSquare(square)}
                  type="button"
                >
                  {fileIndex === 0 && <span className="rank-label">{ranks[rankIndex]}</span>}
                  <span className={`piece ${piece?.color === 'b' ? 'black-piece' : ''}`}>{occupied}</span>
                  {rankIndex === 7 && <span className="file-label">{files[fileIndex]}</span>}
                </button>
              )
            }))}
          </div>
          <p className="board-status" role="status">{notice}</p>
        </div>

        <aside className="side-panel">
          <section className="panel-card">
            <p className="section-label">CURRENT GAME</p>
            <h2>Play against Knight</h2>
            <label htmlFor="difficulty">Bot difficulty</label>
            <select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option>Casual</option>
              <option>Steady</option>
              <option>Sharp</option>
            </select>
            <div className="move-log" aria-label="Move history">
              {game.history.length === 0 ? <p>Moves will appear here.</p> : game.history.map((move, index) => <span key={`${move}-${index}`}>{index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ${move}` : move}</span>)}
            </div>
          </section>

          <section className="panel-card muted-card">
            <p className="section-label">COMING NEXT</p>
            <h2>Your game intelligence</h2>
            <p>Analysis, recurring patterns, and your opening repertoire will build from every completed game.</p>
          </section>
        </aside>
      </section>
    </main>
  )
}

export default App
