import { describe, expect, it } from 'vitest'
import { learnCustomizationRecord } from './records'

describe('learn customisation sync records', () => {
  it('maps a saved opening to the existing added wire state', () => {
    expect(learnCustomizationRecord('sicilian-defense', 'saved', 42)).toEqual({ collection: 'knightshift_learn_customization', openingKey: 'sicilian-defense', state: 'added', revision: 42, payloadVersion: 1 })
  })
})
