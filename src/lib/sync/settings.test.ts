import { describe, expect, it } from 'vitest'
import { chooseSettingsRecord } from './settings'

describe('settings sync merge', () => {
  it('keeps the highest revision', () => {
    expect(chooseSettingsRecord({ revision: 12, payload: { side: 'b', difficulty: 'Sharp' } }, { revision: 11, payload: { side: 'w', difficulty: 'Casual' } })).toEqual({ revision: 12, payload: { side: 'b', difficulty: 'Sharp' } })
  })
})
