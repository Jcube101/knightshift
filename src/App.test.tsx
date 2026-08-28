// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('Knightshift home', () => {
  afterEach(cleanup)

  beforeEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('uses personal, non-repetitive copy for the home entry point', () => {
    render(<App />)

    expect(screen.getByText('YOUR CHESS STUDY')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your next game' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start a game' })).toHaveAttribute('href', '/play')
  })

  it('makes the Home dashboard the entry to the saved-game archive', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'All saved games' })).toHaveAttribute('href', '/history')
    expect(screen.queryByRole('navigation')?.querySelector('a[href="/history"]')).toBeNull()
  })

  it('keeps Learn as a primary workspace while History remains contextual', () => {
    render(<App />)

    const nav = screen.getByRole('navigation')
    expect([...nav.querySelectorAll('a')].map(link => link.textContent)).toEqual(['Home', 'Play', 'Learn', 'Settings'])
    expect(screen.getByRole('link', { name: 'Learn' })).toHaveAttribute('href', '/learn')
    expect(nav.querySelector('a[href="/history"]')).toBeNull()
  })

  it('shows conservative opening context for a saved game', () => {
    localStorage.setItem('knightshift.completed-games', JSON.stringify({ version: 1, games: [{ id: 'sicilian', playedAt: '2026-08-27T00:00:00.000Z', result: '1-0', moves: ['e4', 'c5', 'Nf3', 'd6', 'h4'], playerColor: 'w' }] }))
    render(<App />)

    expect(screen.getByText('Sicilian Defense')).toBeInTheDocument()
    expect(screen.getByText('Unclassified continuation after 2 moves')).toBeInTheDocument()
  })

  it('shows review progress instead of waiting when a saved review can resume', () => {
    localStorage.setItem('knightshift.completed-games', JSON.stringify({ version: 1, games: [{ id: 'resume', playedAt: '2026-08-27T00:00:00.000Z', result: '1-0', moves: ['e4', 'e5'], playerColor: 'w' }] }))
    localStorage.setItem('knightshift.review-jobs', JSON.stringify([{ gameId: 'resume', totalPlayerMoves: 12, nextMoveIndex: 6, candidates: [{ moveNumber: 1, played: 'e4', best: 'e5', loss: 90 }], status: 'paused' }]))
    render(<App />)
    expect(screen.getByText('Review in progress · 1 of 12 moves saved')).toBeInTheDocument()
  })

  it('restores an active game checkpoint after a reload', () => {
    localStorage.setItem('knightshift.active-game', JSON.stringify({
      version: 1,
      activeGame: {
        game: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', history: ['e4', 'e5'], uciHistory: ['e2e4', 'e7e5'] },
        playerColor: 'w', difficulty: 'Sharp', lastCapture: null,
      },
    }))
    vi.stubGlobal('Worker', class { addEventListener() {} removeEventListener() {} postMessage() {} terminate() {} })

    render(<App />)

    expect(screen.getByRole('link', { name: 'Resume game' })).toHaveAttribute('href', '/play')
  })
})
