export type Defaults = { side: 'w' | 'b'; difficulty: 'Casual' | 'Steady' | 'Sharp' }

const defaultsKey = 'knightshift.defaults'
const fallbackDefaults: Defaults = { side: 'w', difficulty: 'Steady' }

export function readDefaults(): Defaults {
  try {
    const stored = JSON.parse(localStorage.getItem(defaultsKey) ?? '{}') as Partial<Defaults>
    return {
      side: stored.side === 'b' ? 'b' : 'w',
      difficulty: stored.difficulty === 'Casual' || stored.difficulty === 'Sharp' ? stored.difficulty : 'Steady',
    }
  } catch {
    return fallbackDefaults
  }
}

export function saveDefaults(defaults: Defaults): void {
  localStorage.setItem(defaultsKey, JSON.stringify(defaults))
}
