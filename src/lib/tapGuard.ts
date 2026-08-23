export function createTapGuard(windowMs: number) {
  let suppressNextTapUntil = 0

  return {
    recordDrop(now: number) {
      suppressNextTapUntil = now + windowMs
    },
    consumeIfSuppressed(now: number): boolean {
      if (now > suppressNextTapUntil) return false
      suppressNextTapUntil = 0
      return true
    },
  }
}
