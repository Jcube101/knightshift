type OpeningStudyState = 'default' | 'saved' | 'hidden'

export type RepertoireEntry = { openingId: string; state: Exclude<OpeningStudyState, 'default'> }

const repertoireKey = 'knightshift.repertoire'

function entries(): RepertoireEntry[] {
  try {
    const value = JSON.parse(localStorage.getItem(repertoireKey) ?? '[]') as unknown
    return Array.isArray(value)
      ? value.filter((entry): entry is RepertoireEntry => Boolean(entry && typeof entry === 'object' && typeof (entry as RepertoireEntry).openingId === 'string' && ((entry as RepertoireEntry).state === 'saved' || (entry as RepertoireEntry).state === 'hidden')))
      : []
  } catch { return [] }
}

export function loadRepertoireEntries(): RepertoireEntry[] { return entries() }
export function replaceRepertoireEntriesForSync(next: RepertoireEntry[]): void { localStorage.setItem(repertoireKey, JSON.stringify(next)) }

export function setOpeningStudyState(openingId: string, state: OpeningStudyState): void {
  const remaining = entries().filter(entry => entry.openingId !== openingId)
  const next = state === 'default' ? remaining : [...remaining, { openingId, state }]
  localStorage.setItem(repertoireKey, JSON.stringify(next))
}

export function savedOpeningIds(): string[] { return entries().filter(entry => entry.state === 'saved').map(entry => entry.openingId) }
export function hiddenOpeningIds(): string[] { return entries().filter(entry => entry.state === 'hidden').map(entry => entry.openingId) }
