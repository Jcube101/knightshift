export type ThemeId = 'green' | 'rwb' | 'royal' | 'amber'

type Theme = {
  label: string
  background: string
  glow: string
  panel: string
  mutedPanel: string
  border: string
  text: string
  softText: string
  eyebrow: string
  action: string
  actionText: string
  boardDark: string
  boardLight: string
  shadow: string
}

export const themes: Record<ThemeId, Theme> = {
  green: {
    label: 'Greenfield', background: '#101714', glow: '#1c3327', panel: '#18231e', mutedPanel: '#152019', border: '#46634f', text: '#f1f4f0', softText: '#b4c4b7', eyebrow: '#8bac67', action: '#b5d87a', actionText: '#17200e', boardDark: '#769867', boardLight: '#dce6cb', shadow: '#00000088',
  },
  rwb: {
    label: 'Stars & Stripes', background: '#061a33', glow: '#123f72', panel: '#0c2545', mutedPanel: '#0a2140', border: '#285b91', text: '#f8fafc', softText: '#c4d7ee', eyebrow: '#8fc5ff', action: '#d7374b', actionText: '#ffffff', boardDark: '#2e6fb4', boardLight: '#edf4fb', shadow: '#020817cc',
  },
  royal: {
    label: 'Royal', background: '#1c102b', glow: '#4a216a', panel: '#2a1640', mutedPanel: '#211132', border: '#6d4c92', text: '#fffaf0', softText: '#e6d7f4', eyebrow: '#e4bf62', action: '#d8aa3c', actionText: '#271400', boardDark: '#7352a0', boardLight: '#f0e9f7', shadow: '#13071fcc',
  },
  amber: {
    label: 'Midnight Amber', background: '#101319', glow: '#2b3340', panel: '#1a2029', mutedPanel: '#151a21', border: '#4b5869', text: '#fff9ed', softText: '#d4c5a6', eyebrow: '#f2bd52', action: '#d98724', actionText: '#1b1003', boardDark: '#66717f', boardLight: '#f1e7d0', shadow: '#030507dd',
  },
}

export const themeOptions = (Object.keys(themes) as ThemeId[]).map((id) => ({ id, label: themes[id].label }))
export const defaultTheme: ThemeId = 'rwb'

export function readTheme(): ThemeId {
  const stored = localStorage.getItem('knightshift.theme')
  return stored && stored in themes ? stored as ThemeId : defaultTheme
}

export function saveTheme(theme: ThemeId) {
  localStorage.setItem('knightshift.theme', theme)
}
