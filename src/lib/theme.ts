export type ThemeId = 'quiet-study'

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
  'quiet-study': {
    label: 'Quiet Study',
    background: '#111813',
    glow: '#1A241C',
    panel: '#1A241C',
    mutedPanel: '#223027',
    border: '#4A5B4B',
    text: '#F5F1E8',
    softText: '#C6D0C6',
    eyebrow: '#E3C67A',
    action: '#A9C97D',
    actionText: '#111813',
    boardDark: '#587257',
    boardLight: '#E9E3D5',
    shadow: '#00000066',
  },
}

export const themeOptions = [{ id: 'quiet-study', label: 'Quiet Study' }] as const
export const defaultTheme: ThemeId = 'quiet-study'

export function readTheme(): ThemeId {
  return defaultTheme
}

export function saveTheme(): void {}
