// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

describe('Knightshift home', () => {
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
    expect(screen.getByLabelText('Engine difficulty')).toBeInTheDocument()
    expect(screen.getByLabelText('Chess board')).toBeInTheDocument()
  })
})
