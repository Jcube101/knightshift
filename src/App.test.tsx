// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Knightshift home', () => {
  it('shows a new game board and bot difficulty control', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Knightshift' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New game' })).toBeInTheDocument()
    expect(screen.getByLabelText('Bot difficulty')).toBeInTheDocument()
    expect(screen.getByLabelText('Chess board')).toBeInTheDocument()
  })
})
