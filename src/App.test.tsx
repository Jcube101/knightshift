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

  it('shows a Stockfish board and engine difficulty control', () => {
    vi.stubGlobal('Worker', class {
      addEventListener() {}
      removeEventListener() {}
      postMessage() {}
      terminate() {}
    })
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Knightshift' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New game' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo last turn' })).toBeDisabled()
    expect(screen.getByLabelText('Engine difficulty')).toBeInTheDocument()
    expect(screen.getByLabelText('Chess board')).toBeInTheDocument()
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

    expect(screen.getByText('1. e4')).toBeInTheDocument()
    expect(screen.getByText('e5')).toBeInTheDocument()
    expect(screen.getByLabelText('Engine difficulty')).toHaveValue('Sharp')
    expect(screen.getByRole('button', { name: 'Undo last turn' })).toBeEnabled()
  })
})
