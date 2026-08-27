// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import LearnScreen from './LearnScreen'

vi.mock('react-chessboard', () => ({ Chessboard: () => <div data-testid="chessboard" /> }))

describe('LearnScreen', () => {
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
