import { describe, expect, it } from 'vitest'
import { defaultTheme, themeOptions, themes } from './theme'

describe('Knightshift theme', () => {
  it('uses one fixed Quiet Study palette', () => {
    expect(themeOptions.map((theme) => theme.id)).toEqual(['quiet-study'])
    expect(defaultTheme).toBe('quiet-study')
    expect(themes['quiet-study'].background).toBe('#111813')
  })
})
