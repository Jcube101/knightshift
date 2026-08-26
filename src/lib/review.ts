export function rankLabel(rank: number): string {
  const numerals = ['', 'I', 'II', 'III']
  const numeral = numerals[rank] ?? String(rank)
  return numeral
}
