export function latestMoveScrollLeft({ scrollWidth, clientWidth }: Pick<HTMLElement, 'scrollWidth' | 'clientWidth'>): number {
  return Math.max(0, scrollWidth - clientWidth)
}
