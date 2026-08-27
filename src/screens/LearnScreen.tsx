import { Chessboard } from 'react-chessboard'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { openingById, openingFamilies, openingsForStudy, replaySan, studyPrompt, variationById, type StudySide } from '../lib/openings'

function lineAtPly(moves: string[], ply: number) {
  return moves.slice(0, ply)
}

export default function LearnScreen() {
  const { openingId } = useParams()
  const opening = openingById(openingId)
  const [study, setStudy] = useState({ openingId, variationId: null as string | null, ply: 0 })
  const [studySide, setStudySide] = useState<StudySide>('w')
  const currentStudy = study.openingId === openingId ? study : { openingId, variationId: null, ply: 0 }
  const studyOpenings = openingsForStudy(studySide)

  if (!openingId) return <section className="learn-page"><div className="learn-intro"><p className="section-label">OPENING EXPLORER</p><h1>Learn the shape of the game.</h1><p>Start with the major opening families, then follow named variations on the board. This is a survey to recognise the ideas and move orders before building a repertoire.</p></div><div className="study-side-toggle" role="group" aria-label="Study side"><button type="button" aria-pressed={studySide === 'w'} className={studySide === 'w' ? 'study-side-button selected' : 'study-side-button'} onClick={() => setStudySide('w')}>Learn as White</button><button type="button" aria-pressed={studySide === 'b'} className={studySide === 'b' ? 'study-side-button selected' : 'study-side-button'} onClick={() => setStudySide('b')}>Learn as Black</button></div><div className="opening-families">{openingFamilies.filter(family => studyOpenings.some(opening => opening.family === family)).map(family => <section className="opening-family" key={family}><p className="section-label">{family.toUpperCase()}</p>{studyOpenings.filter(opening => opening.family === family).map(item => <Link key={item.id} to={`/learn/${item.id}`}><strong>{item.name}</strong><span>{item.startingMoves.map((move, index) => `${index + 1}${index % 2 === 0 ? '.' : '…'}${move}`).join(' ')}</span></Link>)}</section>)}</div></section>

  if (!opening) return <section className="route-card"><p className="section-label">OPENING EXPLORER</p><h1>Opening unavailable</h1><p className="review-copy">Choose an opening from the curated survey.</p><Link to="/learn">Back to Learn</Link></section>

  const variation = variationById(opening, currentStudy.variationId ?? undefined) ?? opening.variations[0]
  const currentMoves = lineAtPly(variation.san, currentStudy.ply)
  const position = replaySan(currentMoves).fen()
  const moveLine = variation.san.map((move, index) => `${index % 2 === 0 ? `${Math.floor(index / 2) + 1}.` : ''}${move}`).join(' ')
  const prompt = studyPrompt(variation, currentStudy.ply, studySide)

  function selectVariation(id: string) { setStudy({ openingId, variationId: id, ply: 0 }) }

  return <section className="learn-page"><Link className="back-link" to="/learn">All openings</Link><div className="learn-detail-heading"><p className="section-label">{opening.family.toUpperCase()} · {variation.eco}</p><h1>{opening.name}</h1><p>{opening.idea}</p></div><div className="learn-detail"><div className="learn-board"><Chessboard options={{ id: `opening-${opening.id}`, position, showNotation: true, boardOrientation: studySide === 'b' ? 'black' : 'white' }} /><p className="study-prompt">{prompt ? `${prompt.label}: ${prompt.move}` : 'This line has reached its current study point.'}</p><div className="line-controls"><button type="button" className="undo-game" onClick={() => setStudy(value => ({ ...value, openingId, ply: Math.max(0, currentStudy.ply - 1) }))} disabled={currentStudy.ply === 0}>Back</button><span>Move {currentStudy.ply} of {variation.san.length}</span><button type="button" className="new-game" onClick={() => setStudy(value => ({ ...value, openingId, ply: Math.min(variation.san.length, currentStudy.ply + 1) }))} disabled={currentStudy.ply === variation.san.length}>Next</button></div><p className="opening-line">{moveLine}</p></div><div className="opening-study"><p className="section-label">SELECTED VARIATION</p><h2>{variation.name}</h2><p className="review-copy">{variation.idea}</p><div className="variation-list">{opening.variations.map(item => <button type="button" className={item.id === variation.id ? 'variation-button selected' : 'variation-button'} key={item.id} onClick={() => selectVariation(item.id)}>{item.name}<span>{item.eco}</span></button>)}</div></div></div></section>
}
