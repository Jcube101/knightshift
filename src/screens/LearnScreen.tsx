import { Chessboard } from 'react-chessboard'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { openingById, openingFamilies, openingsForStudy, replaySan, studyPrompt, variationById, type StudySide } from '../lib/openings'
import { hiddenOpeningIds, savedOpeningIds, setOpeningStudyState } from '../lib/repertoire'
import { learnCustomizationRecord } from '../lib/sync/records'
import { enqueueSyncOperation } from '../lib/sync/outbox'

function queueLearnCustomization(openingId: string, state: 'saved' | 'hidden' | 'default'): void {
  setOpeningStudyState(openingId, state)
  if (state === 'default') return
  const record = learnCustomizationRecord(openingId, state, Date.now())
  enqueueSyncOperation({ id: `learn:${openingId}`, kind: 'learn-customization', payload: record, createdAt: new Date().toISOString() })
}

function lineAtPly(moves: string[], ply: number) {
  return moves.slice(0, ply)
}

export default function LearnScreen() {
  const { openingId } = useParams()
  const opening = openingById(openingId)
  const [study, setStudy] = useState({ openingId, variationId: null as string | null, ply: 0 })
  const [studySide, setStudySide] = useState<StudySide>('w')
  const [customisationVersion, setCustomisationVersion] = useState(0)
  const currentStudy = study.openingId === openingId ? study : { openingId, variationId: null, ply: 0 }
  const hidden = hiddenOpeningIds()
  const saved = savedOpeningIds()
  const savedOpenings = saved.flatMap(id => openingById(id) ? [openingById(id)!] : [])
  const hiddenOpenings = hidden.flatMap(id => openingById(id) ? [openingById(id)!] : [])
  const studyOpenings = openingsForStudy(studySide).filter(item => !hidden.includes(item.id))

  if (!openingId) return <section className="learn-page" data-customisation-version={customisationVersion}><div className="learn-intro"><p className="section-label">OPENING EXPLORER</p><h1>Learn the shape of the game.</h1><p>Start with the major opening families, then follow named variations on the board. This is a survey to recognise the ideas and move orders before building a repertoire.</p></div><section className="route-card"><p className="section-label">YOUR REPERTOIRE</p><h2>My repertoire</h2>{savedOpenings.length ? <div className="saved-games">{savedOpenings.map(item => <Link key={item.id} to={`/learn/${item.id}`}>{item.name}</Link>)}</div> : <p className="review-copy">Save an opening to make it part of your repertoire.</p>}{hiddenOpenings.length ? <><p className="section-label">HIDDEN OPENINGS</p><div className="saved-games">{hiddenOpenings.map(item => <article key={item.id}><strong>{item.name}</strong><button type="button" className="undo-game" onClick={() => { queueLearnCustomization(item.id, 'saved'); setCustomisationVersion(value => value + 1) }}>Restore {item.name}</button></article>)}</div></> : null}</section><div className="study-side-toggle" role="group" aria-label="Study side"><button type="button" aria-pressed={studySide === 'w'} className={studySide === 'w' ? 'study-side-button selected' : 'study-side-button'} onClick={() => setStudySide('w')}>Learn as White</button><button type="button" aria-pressed={studySide === 'b'} className={studySide === 'b' ? 'study-side-button selected' : 'study-side-button'} onClick={() => setStudySide('b')}>Learn as Black</button></div><div className="opening-families">{openingFamilies.filter(family => studyOpenings.some(opening => opening.family === family)).map(family => <section className="opening-family" key={family}><p className="section-label">{family.toUpperCase()}</p>{studyOpenings.filter(opening => opening.family === family).map(item => <Link key={item.id} to={`/learn/${item.id}`}><strong>{item.name}</strong><span>{item.startingMoves.map((move, index) => `${index + 1}${index % 2 === 0 ? '.' : '…'}${move}`).join(' ')}</span></Link>)}</section>)}</div></section>

  if (!opening) return <section className="route-card"><p className="section-label">OPENING EXPLORER</p><h1>Opening unavailable</h1><p className="review-copy">Choose an opening from the curated survey.</p><Link to="/learn">Back to Learn</Link></section>

  const variation = variationById(opening, currentStudy.variationId ?? undefined) ?? opening.variations[0]
  const currentMoves = lineAtPly(variation.san, currentStudy.ply)
  const position = replaySan(currentMoves).fen()
  const moveLine = variation.san.map((move, index) => `${index % 2 === 0 ? `${Math.floor(index / 2) + 1}.` : ''}${move}`).join(' ')
  const prompt = studyPrompt(variation, currentStudy.ply, studySide)

  function selectVariation(id: string) { setStudy({ openingId, variationId: id, ply: 0 }) }

  return <section className="learn-page"><Link className="back-link" to="/learn">All openings</Link><div className="learn-detail-heading"><p className="section-label">{opening.family.toUpperCase()} · {variation.eco}</p><h1>{opening.name}</h1><p>{opening.idea}</p><div className="settings-actions"><button type="button" className="undo-game" onClick={() => { queueLearnCustomization(opening.id, saved.includes(opening.id) ? 'default' : 'saved'); setCustomisationVersion(value => value + 1) }}>{saved.includes(opening.id) ? 'Saved opening' : 'Save opening'}</button><button type="button" className="delete-game" onClick={() => { queueLearnCustomization(opening.id, 'hidden'); setCustomisationVersion(value => value + 1) }}>Hide opening</button></div></div><div className="learn-detail"><div className="learn-board"><Chessboard options={{ id: `opening-${opening.id}`, position, showNotation: true, boardOrientation: studySide === 'b' ? 'black' : 'white' }} /><p className="study-prompt">{prompt ? `${prompt.label}: ${prompt.move}` : 'This line has reached its current study point.'}</p><div className="line-controls"><button type="button" className="undo-game" onClick={() => setStudy(value => ({ ...value, openingId, ply: Math.max(0, currentStudy.ply - 1) }))} disabled={currentStudy.ply === 0}>Back</button><span>Move {currentStudy.ply} of {variation.san.length}</span><button type="button" className="new-game" onClick={() => setStudy(value => ({ ...value, openingId, ply: Math.min(variation.san.length, currentStudy.ply + 1) }))} disabled={currentStudy.ply === variation.san.length}>Next</button></div><p className="opening-line">{moveLine}</p></div><div className="opening-study"><p className="section-label">SELECTED VARIATION</p><h2>{variation.name}</h2><p className="review-copy">{variation.idea}</p><div className="variation-list">{opening.variations.map(item => <button type="button" className={item.id === variation.id ? 'variation-button selected' : 'variation-button'} key={item.id} onClick={() => selectVariation(item.id)}>{item.name}<span>{item.eco}</span></button>)}</div></div></div></section>
}
