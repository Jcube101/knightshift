export type TapMove = { from: string; to: string }

export function resolveTap(selected: string | null, square: string, isWhitePiece: boolean): { selected: string | null; move: TapMove | null } {
  if (isWhitePiece) return { selected: square, move: null }
  if (!selected) return { selected: null, move: null }
  return { selected, move: { from: selected, to: square } }
}
