import { describe, expect, it } from 'vitest'
import { defaultTheme, themeOptions, themes } from './theme'

describe('Knightshift themes', () => {
  it('offers the four supported colour schemes', () => {
    expect(themeOptions.map((theme) => theme.id)).toEqual(['green', 'rwb', 'royal', 'amber'])
  })

  it('uses the red, white, and blue scheme by default', () => {
    expect(defaultTheme).toBe('rwb')
    expect(themes.royal.boardDark).not.toBe(themes.amber.boardDark)
  })
})
