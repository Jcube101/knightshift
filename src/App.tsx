import { Chessboard } from 'react-chessboard'
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom'
import { useState, type CSSProperties } from 'react'
import { loadActiveGame, loadSavedGames } from './lib/storage'
import { summarizeInsights } from './lib/insights'
import { describeReply, moveToSan, type CriticalMoment } from './lib/analysis'
import { rankLabel } from './lib/review'
import { readTheme, saveTheme, themeOptions, themes, type ThemeId } from './lib/theme'
import PlayScreen from './screens/PlayScreen'
import './App.css'

const defaultsKey = 'knightshift.defaults'
type Defaults = { side: 'w' | 'b'; difficulty: 'Casual' | 'Steady' | 'Sharp' }
function readDefaults(): Defaults { try { return { side: 'w', difficulty: 'Steady', ...JSON.parse(localStorage.getItem(defaultsKey) ?? '{}') } } catch { return { side: 'w', difficulty: 'Steady' } } }

function Shell({ children }: { children: React.ReactNode }) {
  const theme = readTheme()
  const palette = themes[theme]
  const style = { '--theme-background': palette.background, '--theme-glow': palette.glow, '--theme-panel': palette.panel, '--theme-muted-panel': palette.mutedPanel, '--theme-border': palette.border, '--theme-text': palette.text, '--theme-soft-text': palette.softText, '--theme-eyebrow': palette.eyebrow, '--theme-action': palette.action, '--theme-action-text': palette.actionText } as CSSProperties
  return <main className="app-shell routed-shell" style={style}><header className="route-header"><Link to="/" className="brand">Knightshift</Link><nav>{[['/', 'Home'], ['/play', 'Play'], ['/history', 'History'], ['/settings', 'Settings']].map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}</nav></header>{children}</main>
}

function Home() {
  const active = loadActiveGame(); const games = loadSavedGames(); const reviewed = games.filter(game => game.analysisVersion === 1 && game.analysis)
  const latest = reviewed[0]
  return <Shell><section className="route-card hero-card"><p className="section-label">PERSONAL CHESS WORKSPACE</p><h1>Play with purpose.</h1><p>{active ? 'Your game is saved and ready when you are.' : 'Play a game, review the moments that mattered, then notice what repeats.'}</p><Link className="new-game" to="/play">{active ? 'Resume game' : 'Play a game'}</Link></section><section className="route-card"><p className="section-label">PROGRESS</p><h2>{reviewed.length} analysed {reviewed.length === 1 ? 'game' : 'games'}</h2>{latest ? <Link to={`/review/${latest.id}`}>Review ready: your latest analysed game</Link> : <p className="review-copy">Finish and analyse a game to start your improvement history.</p>}</section></Shell>
}

function History() {
 const games = loadSavedGames().filter(game => game.playerColor); const insights = summarizeInsights(games.filter(game => game.analysisVersion === 1 && game.analysis))
 return <Shell><section className="route-card"><p className="section-label">IMPROVEMENT HISTORY</p><h1>History</h1>{insights.length ? <div className="insight-list">{insights.map(insight => <p key={insight.kind}><strong>{insight.count}</strong> {insight.label.toLowerCase()}</p>)}</div> : <p className="review-copy">Analyse completed games to start spotting patterns.</p>}<div className="saved-games">{games.length ? games.map(game => <article key={game.id}><strong>{new Date(game.playedAt).toLocaleDateString()}</strong><span>You played {game.playerColor === 'w' ? 'White' : 'Black'} · {game.moves.length} plies · {game.result}</span>{game.analysis ? <Link to={`/review/${game.id}`}>Open saved review · {game.analysis.length} moments</Link> : <span>Waiting for analysis</span>}</article>) : <p className="review-copy">New analysed games will appear here. Older saved games remain archived.</p>}</div></section></Shell>
}

function Settings() {
 const [theme, setTheme] = useState<ThemeId>(readTheme); const [defaults, setDefaults] = useState<Defaults>(readDefaults)
 function update(next: Partial<Defaults>) { const saved = { ...defaults, ...next }; setDefaults(saved); localStorage.setItem(defaultsKey, JSON.stringify(saved)) }
 return <Shell><section className="route-card"><p className="section-label">DEFAULTS</p><h1>Settings</h1><label htmlFor="theme">Theme</label><select id="theme" value={theme} onChange={event => { const value = event.target.value as ThemeId; setTheme(value); saveTheme(value) }}>{themeOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select><label htmlFor="default-side">Default side</label><select id="default-side" value={defaults.side} onChange={event => update({ side: event.target.value as 'w' | 'b' })}><option value="w">White</option><option value="b">Black</option></select><label htmlFor="default-difficulty">Default difficulty</label><select id="default-difficulty" value={defaults.difficulty} onChange={event => update({ difficulty: event.target.value as Defaults['difficulty'] })}><option>Casual</option><option>Steady</option><option>Sharp</option></select><p className="review-copy">These defaults apply to your next new game. Your completed games and active game remain local to this browser.</p></section></Shell>
}

function reviewSquareStyles(moment: CriticalMoment): Record<string, CSSProperties> {
 const styles: Record<string, CSSProperties> = {}
 for (const [move, color] of [[moment.playedUci, 'rgba(220, 70, 70, .55)'], [moment.best, 'rgba(65, 175, 115, .55)']] as const) { if (move && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) { styles[move.slice(0, 2)] = { backgroundColor: color }; styles[move.slice(2, 4)] = { backgroundColor: color } } }
 return styles
}

function Review() {
 const { gameId } = useParams(); const game = loadSavedGames().find(saved => saved.id === gameId); const [moment, setMoment] = useState<CriticalMoment | null>(() => game?.analysis?.find(item => item.rank === 1) ?? null)
 if (!game?.analysis) return <Shell><section className="route-card"><h1>Review unavailable</h1><Link to="/history">Back to History</Link></section></Shell>
 return <Shell><section className="route-card"><p className="section-label">SAVED REVIEW</p><h1>{new Date(game.playedAt).toLocaleDateString()}</h1><p className="review-copy">You played {game.playerColor === 'w' ? 'White' : 'Black'} · {game.result} · {game.difficulty}</p><div className="moment-picker">{game.analysis.map(item => <button className={moment === item ? 'moment-button selected' : 'moment-button'} key={`${item.moveIndex}-${item.rank}`} onClick={() => setMoment(item)} type="button">Move {item.moveNumber}: {item.played} · {rankLabel(item.rank)}</button>)}</div>{moment?.beforeFen && <div className="review-detail"><div className="review-board"><Chessboard options={{ id: 'saved-review-board', position: moment.beforeFen, boardOrientation: game.playerColor === 'w' ? 'white' : 'black', showNotation: true, squareStyles: reviewSquareStyles(moment) }} /></div><div><p className="review-legend"><span className="legend-played">Red</span> your move <span className="legend-best">Green</span> better option</p><p className="section-label">MOVE {moment.moveNumber}</p><h2>Instead of {moment.played}, try {moveToSan(moment.beforeFen, moment.best)}</h2><p className="review-copy">{moment.afterFen && moment.replyUci ? describeReply(moment.afterFen, moment.replyUci) ?? moment.explanation : moment.explanation}</p></div></div>}</section></Shell>
}

export default function App() { return <BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/play" element={<PlayScreen />} /><Route path="/history" element={<History />} /><Route path="/settings" element={<Settings />} /><Route path="/review/:gameId" element={<Review />} /></Routes></BrowserRouter> }
