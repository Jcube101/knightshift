import { Chessboard } from 'react-chessboard'
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom'
import { useState, type CSSProperties } from 'react'
import { readDefaults, saveDefaults, type Defaults } from './lib/defaults'
import { deleteCompletedGame, loadActiveGame, loadSavedGames } from './lib/storage'
import { summarizeInsights } from './lib/insights'
import { describeReply, moveToSan, type CriticalMoment } from './lib/analysis'
import { rankLabel } from './lib/review'
import { readTheme, themes } from './lib/theme'
import { openingForSavedGame, openingLabel } from './lib/savedGameOpening'
import { openingReflection } from './lib/openingReflection'
import { deleteReviewJob, loadReviewJob, normalizeReviewJob } from './lib/reviewJob'
import PlayScreen from './screens/PlayScreen'
import LearnScreen from './screens/LearnScreen'
import './App.css'

function Shell({ children }: { children: React.ReactNode }) {
  const theme = readTheme()
  const palette = themes[theme]
  const style = { '--theme-background': palette.background, '--theme-glow': palette.glow, '--theme-panel': palette.panel, '--theme-muted-panel': palette.mutedPanel, '--theme-border': palette.border, '--theme-text': palette.text, '--theme-soft-text': palette.softText, '--theme-eyebrow': palette.eyebrow, '--theme-action': palette.action, '--theme-action-text': palette.actionText } as CSSProperties
  return <main className="app-shell routed-shell" style={style}><header className="route-header"><Link to="/" className="brand">Knightshift</Link><nav>{[['/', 'Home'], ['/play', 'Play'], ['/learn', 'Learn'], ['/settings', 'Settings']].map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}</nav></header>{children}</main>
}

function OpeningContext({ game }: { game: ReturnType<typeof loadSavedGames>[number] }) {
  const opening = openingForSavedGame(game)
  const reflection = openingReflection(opening, game.analysis)
  const detail = opening.status === 'identified' && opening.continuation === 'unclassified'
    ? `Unclassified continuation after ${Math.ceil(opening.matchedPly / 2)} moves`
    : reflection.kind === 'after-recognised-line'
      ? `First recorded critical moment after the recognised line, move ${reflection.moveNumber}`
      : reflection.kind === 'during-recognised-line'
        ? `First recorded critical moment during the recognised line, move ${reflection.moveNumber}`
        : reflection.kind === 'not-analysed' ? 'Opening context only. Analyse this game for critical moments.' : null
  return <span className="opening-context"><strong>{openingLabel(opening)}</strong>{detail && <small>{detail}</small>}</span>
}

function ReviewStatus({ game }: { game: ReturnType<typeof loadSavedGames>[number] }) {
  if (game.analysis) return <Link to={`/review/${game.id}`}>Open saved review{game.analysis.length ? ` · ${game.analysis.length} moments` : ''}</Link>
  const job = loadReviewJob(game.id)
  const normalized = job ? normalizeReviewJob(job, game.playerColor ?? 'w') : null
  return normalized && normalized.status !== 'complete' ? <Link to={`/play?review=${game.id}`}>Review in progress · {normalized.candidates.length} of {normalized.totalPlayerMoves} moves saved</Link> : <span>Waiting for analysis</span>
}

function DeleteGameButton({ gameId }: { gameId: string }) {
  const remove = () => {
    if (!window.confirm('Delete this saved game and its review? This cannot be undone.')) return
    deleteCompletedGame(gameId); deleteReviewJob(gameId); window.location.reload()
  }
  return <button className="delete-game" type="button" onClick={remove}>Delete game</button>
}

function Home() {
  const active = loadActiveGame(); const games = loadSavedGames().filter(game => game.playerColor); const reviewed = games.filter(game => game.analysisVersion === 1 && game.analysis); const latest = reviewed[0]; const insight = summarizeInsights(reviewed)[0]; const recent = games.slice(0, 4)
  return <Shell>
    <section className="route-card hero-card"><p className="section-label">YOUR CHESS STUDY</p><h1>Your next game</h1><p>{active ? 'Your game is saved and ready when you are.' : 'Start a game, review the moments that mattered, then notice what repeats.'}</p><Link className="new-game" to="/play">{active ? 'Resume game' : 'Start a game'}</Link></section>
    {latest && <section className="route-card"><p className="section-label">LATEST LESSON</p><h2>Review ready</h2><p className="review-copy">Your most recent analysed game is ready to revisit.</p><Link to={`/review/${latest.id}`}>Open saved review</Link></section>}
    <section className="route-card"><p className="section-label">PATTERN TO NOTICE</p>{insight ? <p className="review-copy"><strong>{insight.count}</strong> {insight.label.toLowerCase()}</p> : <p className="review-copy">Finish and analyse a game to start noticing what repeats.</p>}</section>
    <section className="route-card"><p className="section-label">RECENT GAMES</p><h2>{recent.length ? 'Your latest games' : 'No saved games yet'}</h2><div className="saved-games">{recent.length ? recent.map(game => <article key={game.id}><strong>{new Date(game.playedAt).toLocaleDateString()}</strong><span>You played {game.playerColor === 'w' ? 'White' : 'Black'} · {game.moves.length} plies · {game.result}</span><OpeningContext game={game}/><ReviewStatus game={game}/><DeleteGameButton gameId={game.id}/></article>) : <p className="review-copy">Completed games will appear here.</p>}</div><Link className="archive-link" to="/history">All saved games</Link></section>
  </Shell>
}

function History() {
 const games = loadSavedGames().filter(game => game.playerColor); const insights = summarizeInsights(games.filter(game => game.analysisVersion === 1 && game.analysis))
 return <Shell><section className="route-card"><p className="section-label">IMPROVEMENT HISTORY</p><h1>History</h1>{insights.length ? <div className="insight-list">{insights.map(insight => <p key={insight.kind}><strong>{insight.count}</strong> {insight.label.toLowerCase()}</p>)}</div> : <p className="review-copy">Analyse completed games to start spotting patterns.</p>}<div className="saved-games">{games.length ? games.map(game => <article key={game.id}><strong>{new Date(game.playedAt).toLocaleDateString()}</strong><span>You played {game.playerColor === 'w' ? 'White' : 'Black'} · {game.moves.length} plies · {game.result}</span><OpeningContext game={game}/><ReviewStatus game={game}/><DeleteGameButton gameId={game.id}/></article>) : <p className="review-copy">New analysed games will appear here. Older saved games remain archived.</p>}</div></section></Shell>
}

function Settings() {
 const [defaults, setDefaults] = useState<Defaults>(readDefaults)
 function update(next: Partial<Defaults>) { const saved = { ...defaults, ...next }; setDefaults(saved); saveDefaults(saved) }
 return <Shell><section className="route-card"><p className="section-label">DEFAULTS</p><h1>Settings</h1><p className="review-copy">Quiet Study is Knightshift’s fixed visual system.</p><label htmlFor="default-side">Default side</label><select id="default-side" value={defaults.side} onChange={event => update({ side: event.target.value as 'w' | 'b' })}><option value="w">White</option><option value="b">Black</option></select><label htmlFor="default-difficulty">Default difficulty</label><select id="default-difficulty" value={defaults.difficulty} onChange={event => update({ difficulty: event.target.value as Defaults['difficulty'] })}><option>Casual</option><option>Steady</option><option>Sharp</option></select><p className="review-copy">These defaults apply to your next new game. Your completed games and active game remain local to this browser.</p></section></Shell>
}

function reviewSquareStyles(moment: CriticalMoment): Record<string, CSSProperties> {
 const styles: Record<string, CSSProperties> = {}
 for (const [move, color] of [[moment.playedUci, 'rgba(220, 70, 70, .55)'], [moment.best, 'rgba(65, 175, 115, .55)']] as const) { if (move && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) { styles[move.slice(0, 2)] = { backgroundColor: color }; styles[move.slice(2, 4)] = { backgroundColor: color } } }
 return styles
}

function Review() {
 const { gameId } = useParams(); const game = loadSavedGames().find(saved => saved.id === gameId); const [moment, setMoment] = useState<CriticalMoment | null>(() => game?.analysis?.find(item => item.rank === 1) ?? null)
 if (!game?.analysis) return <Shell><section className="route-card"><h1>Review unavailable</h1><Link to="/">Back to Home</Link></section></Shell>
 return <Shell><section className="route-card"><p className="section-label">SAVED REVIEW</p><h1>{new Date(game.playedAt).toLocaleDateString()}</h1><p className="review-copy">You played {game.playerColor === 'w' ? 'White' : 'Black'} · {game.result} · {game.difficulty}</p><OpeningContext game={game}/><div className="moment-picker">{game.analysis.map(item => <button className={moment === item ? 'moment-button selected' : 'moment-button'} key={`${item.moveIndex}-${item.rank}`} onClick={() => setMoment(item)} type="button">Move {item.moveNumber}: {item.played} · {rankLabel(item.rank)}</button>)}</div>{moment?.beforeFen && <div className="review-detail"><div className="review-board"><Chessboard options={{ id: 'saved-review-board', position: moment.beforeFen, boardOrientation: game.playerColor === 'w' ? 'white' : 'black', showNotation: true, squareStyles: reviewSquareStyles(moment) }} /></div><div><p className="review-legend"><span className="legend-played">Red</span> your move <span className="legend-best">Green</span> better option</p><p className="section-label">MOVE {moment.moveNumber}</p><h2>Instead of {moment.played}, try {moveToSan(moment.beforeFen, moment.best)}</h2><p className="review-copy">{moment.afterFen && moment.replyUci ? describeReply(moment.afterFen, moment.replyUci) ?? moment.explanation : moment.explanation}</p></div></div>}</section></Shell>
}

export default function App() { return <BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/play" element={<PlayScreen />} /><Route path="/learn" element={<Shell><LearnScreen /></Shell>} /><Route path="/learn/:openingId" element={<Shell><LearnScreen /></Shell>} /><Route path="/history" element={<History />} /><Route path="/settings" element={<Settings />} /><Route path="/review/:gameId" element={<Review />} /></Routes></BrowserRouter> }
