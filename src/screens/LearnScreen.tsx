import { Chessboard } from 'react-chessboard'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { openingById, openingFamilies, openings, replaySan, variationById } from '../lib/openings'

function lineAtPly(moves: string[], ply: number) {
  return moves.slice(0, ply)
}

export default function LearnScreen() {
  const { openingId } = useParams()
  const opening = openingById(openingId)
  const [variationId, setVariationId] = useState<string | null>(null)
  const [ply, setPly] = useState(0)

  if (!openingId) return <section className="learn-page"><div className="learn-intro"><p className="section-label">OPENING EXPLORER</p><h1>Learn the shape of the game.</h1><p>Start with the major opening families, then follow named variations on the board. This is a survey to recognise the ideas and move orders before building a repertoire.</p></div><div className="opening-families">{openingFamilies.map(family => <section className="opening-family" key={family}><p className="section-label">{family.toUpperCase()}</p>{openings.filter(opening => opening.family === family).map(item => <Link key={item.id} to={`/learn/${item.id}`}><strong>{item.name}</strong><span>{item.startingMoves.map((move, index) => `${index + 1}${index % 2 === 0 ? '.' : '…'}${move}`).join(' ')}</span></Link>)}</section>)}</div></section>

  if (!opening) return <section className="route-card"><p className="section-label">OPENING EXPLORER</p><h1>Opening unavailable</h1><p className="review-copy">Choose an opening from the curated survey.</p><Link to="/learn">Back to Learn</Link></section>

  const variation = variationById(opening, variationId ?? undefined) ?? opening.variations[0]
  const currentMoves = lineAtPly(variation.san, ply)
  const position = replaySan(currentMoves).fen()
  const moveLine = variation.san.map((move, index) => `${index % 2 === 0 ? `${Math.floor(index / 2) + 1}.` : ''}${move}`).join(' ')

  function selectVariation(id: string) { setVariationId(id); setPly(0) }

  return <section className="learn-page"><Link className="back-link" to="/learn">All openings</Link><div className="learn-detail-heading"><p className="section-label">{opening.family.toUpperCase()} · {variation.eco}</p><h1>{opening.name}</h1><p>{opening.idea}</p></div><div className="learn-detail"><div className="learn-board"><Chessboard options={{ id: `opening-${opening.id}`, position, showNotation: true }} /><div className="line-controls"><button type="button" className="undo-game" onClick={() => setPly(value => Math.max(0, value - 1))} disabled={ply === 0}>Back</button><span>Move {ply} of {variation.san.length}</span><button type="button" className="new-game" onClick={() => setPly(value => Math.min(variation.san.length, value + 1))} disabled={ply === variation.san.length}>Next</button></div><p className="opening-line">{moveLine}</p></div><div className="opening-study"><p className="section-label">SELECTED VARIATION</p><h2>{variation.name}</h2><p className="review-copy">{variation.idea}</p><div className="variation-list">{opening.variations.map(item => <button type="button" className={item.id === variation.id ? 'variation-button selected' : 'variation-button'} key={item.id} onClick={() => selectVariation(item.id)}>{item.name}<span>{item.eco}</span></button>)}</div></div></div></section>
}
