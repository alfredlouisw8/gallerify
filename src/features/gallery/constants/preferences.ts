import type { GalleryPreferences } from '@/types'

export type ThemeTokens = {
  bg: string
  bgDim: string
  surface: string
  border: string
  text: string
  textMuted: string
  textDim: string
  pillBg: string
  gradient: string
}

export const THEMES: Record<GalleryPreferences['colorTheme'], ThemeTokens> = {
  dark: {
    bg:        'oklch(0.11 0.008 60)',
    bgDim:     'oklch(0.18 0.012 60)',
    surface:   'oklch(0.11 0.008 60 / 0.92)',
    border:    'oklch(0.22 0.006 60)',
    text:      'oklch(0.95 0.008 80)',
    textMuted: 'oklch(0.60 0.008 80)',
    textDim:   'oklch(0.50 0.010 80)',
    pillBg:    'oklch(0.20 0.008 60)',
    gradient:  'linear-gradient(to top, oklch(0.09 0.008 60) 0%, oklch(0.09 0.008 60 / 0.4) 35%, transparent 65%)',
  },
  light: {
    bg:        'oklch(0.97 0.006 70)',
    bgDim:     'oklch(0.92 0.008 70)',
    surface:   'oklch(0.97 0.006 70 / 0.92)',
    border:    'oklch(0.88 0.008 70)',
    text:      'oklch(0.18 0.010 70)',
    textMuted: 'oklch(0.45 0.010 70)',
    textDim:   'oklch(0.58 0.008 70)',
    pillBg:    'oklch(0.90 0.006 70)',
    gradient:  'linear-gradient(to top, oklch(0.92 0.006 70) 0%, oklch(0.92 0.006 70 / 0.4) 35%, transparent 65%)',
  },
  rose: {
    bg:        'oklch(0.20 0.055 10)',
    bgDim:     'oklch(0.27 0.060 10)',
    surface:   'oklch(0.20 0.055 10 / 0.92)',
    border:    'oklch(0.34 0.050 10)',
    text:      'oklch(0.96 0.008 20)',
    textMuted: 'oklch(0.68 0.030 20)',
    textDim:   'oklch(0.55 0.020 20)',
    pillBg:    'oklch(0.28 0.055 10)',
    gradient:  'linear-gradient(to top, oklch(0.16 0.055 10) 0%, oklch(0.16 0.055 10 / 0.4) 35%, transparent 65%)',
  },
  sand: {
    bg:        'oklch(0.24 0.050 75)',
    bgDim:     'oklch(0.31 0.055 75)',
    surface:   'oklch(0.24 0.050 75 / 0.92)',
    border:    'oklch(0.38 0.045 75)',
    text:      'oklch(0.96 0.012 80)',
    textMuted: 'oklch(0.70 0.030 75)',
    textDim:   'oklch(0.56 0.020 75)',
    pillBg:    'oklch(0.32 0.050 75)',
    gradient:  'linear-gradient(to top, oklch(0.19 0.050 75) 0%, oklch(0.19 0.050 75 / 0.4) 35%, transparent 65%)',
  },
  olive: {
    bg:        'oklch(0.20 0.060 130)',
    bgDim:     'oklch(0.27 0.065 130)',
    surface:   'oklch(0.20 0.060 130 / 0.92)',
    border:    'oklch(0.34 0.055 130)',
    text:      'oklch(0.95 0.010 130)',
    textMuted: 'oklch(0.68 0.035 130)',
    textDim:   'oklch(0.55 0.025 130)',
    pillBg:    'oklch(0.28 0.060 130)',
    gradient:  'linear-gradient(to top, oklch(0.15 0.060 130) 0%, oklch(0.15 0.060 130 / 0.4) 35%, transparent 65%)',
  },
}

export const ACCENTS: Record<GalleryPreferences['accentColor'], string> = {
  gold:  'oklch(0.78 0.09 80)',
  ivory: 'oklch(0.90 0.03 88)',
  sage:  'oklch(0.72 0.08 145)',
  rose:  'oklch(0.72 0.09 10)',
  slate: 'oklch(0.68 0.05 230)',
}
