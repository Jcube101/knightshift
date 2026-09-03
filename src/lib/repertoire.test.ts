// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { hiddenOpeningIds, savedOpeningIds, setOpeningStudyState } from './repertoire'

beforeEach(() => localStorage.clear())

describe('opening study customisation', () => {
  it('saves an opening locally', () => {
    setOpeningStudyState('sicilian-defense', 'saved')

    expect(savedOpeningIds()).toEqual(['sicilian-defense'])
    expect(hiddenOpeningIds()).toEqual([])
  })

  it('hides an opening without saving it', () => {
    setOpeningStudyState('sicilian-defense', 'hidden')

    expect(hiddenOpeningIds()).toEqual(['sicilian-defense'])
    expect(savedOpeningIds()).toEqual([])
  })

  it('restores a hidden opening to the catalogue', () => {
    setOpeningStudyState('sicilian-defense', 'hidden')
    setOpeningStudyState('sicilian-defense', 'default')

    expect(hiddenOpeningIds()).toEqual([])
  })
})
