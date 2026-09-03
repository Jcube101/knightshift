import { describe, expect, it } from 'vitest'
import { mergeRemoteLearnCustomization } from './pull'

describe('mergeRemoteLearnCustomization', () => {
  it('applies remote added and hidden states onto local repertoire entries', () => {
    const remote = [
      { opening_key: 'sicilian-defense', state: 'added' as const },
      { opening_key: 'kings-indian-defense', state: 'hidden' as const },
    ]

    expect(mergeRemoteLearnCustomization([], remote)).toEqual([
      { openingId: 'sicilian-defense', state: 'saved' },
      { openingId: 'kings-indian-defense', state: 'hidden' },
    ])
  })

  it('lets a remote record override a differing local entry for the same opening', () => {
    const local = [{ openingId: 'sicilian-defense', state: 'hidden' as const }]
    const remote = [{ opening_key: 'sicilian-defense', state: 'added' as const }]

    expect(mergeRemoteLearnCustomization(local, remote)).toEqual([{ openingId: 'sicilian-defense', state: 'saved' }])
  })
})
