export type TapMove = { from: string; to: string }

export function resolveTap(selected: string | null, square: string): { selected: string | null; move: TapMove | null } {
  if (!selected || selected === square) return { selected: square, move: null }
  return { selected: null, move: { from: selected, to: square } }
}
