import { describe, expect, it } from 'vitest'
import { createTapGuard } from './tapGuard'

describe('createTapGuard', () => {
  it('consumes the one trailing square tap after a drop without blocking a later deliberate tap', () => {
    const guard = createTapGuard(200)

    guard.recordDrop(1_000)
    expect(guard.consumeIfSuppressed(1_050)).toBe(true)
    expect(guard.consumeIfSuppressed(1_051)).toBe(false)
    expect(guard.consumeIfSuppressed(1_300)).toBe(false)
  })
})
