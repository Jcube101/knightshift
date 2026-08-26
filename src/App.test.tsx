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

  it('shows a focused home dashboard and play entry point', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Play with purpose.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Play a game' })).toHaveAttribute('href', '/play')
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
