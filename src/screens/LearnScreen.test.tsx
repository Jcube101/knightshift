// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LearnScreen from './LearnScreen'

vi.mock('react-chessboard', () => ({ Chessboard: () => <div data-testid="chessboard" /> }))

describe('LearnScreen', () => {
  afterEach(cleanup)

  it('exposes the selected study side as an accessible segmented control', () => {
    render(
      <MemoryRouter initialEntries={['/learn']}>
        <Routes><Route path="/learn" element={<LearnScreen />} /></Routes>
      </MemoryRouter>,
    )

    const white = screen.getByRole('button', { name: 'Learn as White' })
    const black = screen.getByRole('button', { name: 'Learn as Black' })
    expect(white).toHaveAttribute('aria-pressed', 'true')
    expect(black).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(black)
    expect(white).toHaveAttribute('aria-pressed', 'false')
    expect(black).toHaveAttribute('aria-pressed', 'true')
  })

  it('resets the move position when switching to another opening', () => {
    render(
      <MemoryRouter initialEntries={['/learn/kings-indian-defense']}>
        <Routes>
          <Route path="/learn" element={<LearnScreen />} />
          <Route path="/learn/:openingId" element={<LearnScreen />} />
        </Routes>
      </MemoryRouter>,
    )

    for (let index = 0; index < 8; index += 1) fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText(/Move 8 of/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'All openings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Learn as Black' }))
    fireEvent.click(screen.getByRole('link', { name: /Caro-Kann Defense/i }))

    expect(screen.getByText('Move 0 of 8')).toBeInTheDocument()
  })
})
