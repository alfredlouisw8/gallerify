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

function hexMix(base: string, target: string, t: number): string {
  const br = parseInt(base.slice(1, 3), 16), bg_ = parseInt(base.slice(3, 5), 16), bb = parseInt(base.slice(5, 7), 16)
  const tr = parseInt(target.slice(1, 3), 16), tg = parseInt(target.slice(3, 5), 16), tb = parseInt(target.slice(5, 7), 16)
  const r = Math.round(br + (tr - br) * t)
  const g = Math.round(bg_ + (tg - bg_) * t)
  const b = Math.round(bb + (tb - bb) * t)
  return `rgb(${r},${g},${b})`
}

export function generateCustomTheme(hex: string): ThemeTokens {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const isDark = lum < 0.45

  return isDark ? {
    bg:        hex,
    bgDim:     hexMix(hex, '#ffffff', 0.10),
    surface:   hex + 'eb',
    border:    hexMix(hex, '#ffffff', 0.16),
    text:      'oklch(0.95 0.008 80)',
    textMuted: 'oklch(0.60 0.008 80)',
    textDim:   'oklch(0.48 0.010 80)',
    pillBg:    hexMix(hex, '#ffffff', 0.12),
    gradient:  `linear-gradient(to top, ${hex} 0%, ${hex}cc 30%, transparent 70%)`,
  } : {
    bg:        hex,
    bgDim:     hexMix(hex, '#000000', 0.07),
    surface:   hex + 'eb',
    border:    hexMix(hex, '#000000', 0.13),
    text:      'oklch(0.16 0.010 70)',
    textMuted: 'oklch(0.42 0.010 70)',
    textDim:   'oklch(0.56 0.008 70)',
    pillBg:    hexMix(hex, '#000000', 0.09),
    gradient:  `linear-gradient(to top, ${hex} 0%, ${hex}cc 30%, transparent 70%)`,
  }
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
    gradient:  'linear-gradient(to top, oklch(0.11 0.008 60) 0%, oklch(0.11 0.008 60 / 0.5) 40%, transparent 70%)',
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
    gradient:  'linear-gradient(to top, oklch(0.97 0.006 70) 0%, oklch(0.97 0.006 70 / 0.5) 40%, transparent 70%)',
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
    gradient:  'linear-gradient(to top, oklch(0.20 0.055 10) 0%, oklch(0.20 0.055 10 / 0.5) 40%, transparent 70%)',
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
    gradient:  'linear-gradient(to top, oklch(0.24 0.050 75) 0%, oklch(0.24 0.050 75 / 0.5) 40%, transparent 70%)',
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
    gradient:  'linear-gradient(to top, oklch(0.20 0.060 130) 0%, oklch(0.20 0.060 130 / 0.5) 40%, transparent 70%)',
  },
  custom: {
    bg:        'oklch(0.11 0.008 60)',
    bgDim:     'oklch(0.18 0.012 60)',
    surface:   'oklch(0.11 0.008 60 / 0.92)',
    border:    'oklch(0.22 0.006 60)',
    text:      'oklch(0.95 0.008 80)',
    textMuted: 'oklch(0.60 0.008 80)',
    textDim:   'oklch(0.50 0.010 80)',
    pillBg:    'oklch(0.20 0.008 60)',
    gradient:  'linear-gradient(to top, oklch(0.11 0.008 60) 0%, oklch(0.11 0.008 60 / 0.5) 40%, transparent 70%)',
  },
}

export const FONT_PAIRS: Record<
  GalleryPreferences['fontPairing'],
  { display: string; body: string; displayLabel: string; bodyLabel: string }
> = {
  'bodoni-jost':                   { display: 'var(--font-bodoni)',              body: 'var(--font-jost)',           displayLabel: 'Bodoni Moda',          bodyLabel: 'Jost' },
  'playfair-inter':                { display: 'var(--font-playfair)',             body: 'var(--font-inter)',          displayLabel: 'Playfair Display',     bodyLabel: 'Inter' },
  'cormorant-outfit':              { display: 'var(--font-cormorant)',            body: 'var(--font-outfit)',         displayLabel: 'Cormorant Garamond',   bodyLabel: 'Outfit' },
  'dm-serif-dm-sans':              { display: 'var(--font-dm-serif)',             body: 'var(--font-dm-sans)',        displayLabel: 'DM Serif Display',     bodyLabel: 'DM Sans' },
  'fraunces-nunito-sans':          { display: 'var(--font-fraunces)',             body: 'var(--font-nunito-sans)',    displayLabel: 'Fraunces',             bodyLabel: 'Nunito Sans' },
  'eb-garamond-lato':              { display: 'var(--font-eb-garamond)',          body: 'var(--font-lato)',           displayLabel: 'EB Garamond',          bodyLabel: 'Lato' },
  'cinzel-raleway':                { display: 'var(--font-cinzel)',               body: 'var(--font-raleway)',        displayLabel: 'Cinzel',               bodyLabel: 'Raleway' },
  'lora-montserrat':               { display: 'var(--font-lora)',                 body: 'var(--font-montserrat)',     displayLabel: 'Lora',                 bodyLabel: 'Montserrat' },
  'spectral-karla':                { display: 'var(--font-spectral)',             body: 'var(--font-karla)',          displayLabel: 'Spectral',             bodyLabel: 'Karla' },
  'libre-baskerville-source-sans': { display: 'var(--font-libre-baskerville)',   body: 'var(--font-source-sans)',    displayLabel: 'Libre Baskerville',    bodyLabel: 'Source Sans 3' },
  'italiana-open-sans':            { display: 'var(--font-italiana)',             body: 'var(--font-open-sans)',      displayLabel: 'Italiana',             bodyLabel: 'Open Sans' },
  'tenor-sans-mulish':             { display: 'var(--font-tenor-sans)',           body: 'var(--font-mulish)',         displayLabel: 'Tenor Sans',           bodyLabel: 'Mulish' },
  'forum-nunito':                  { display: 'var(--font-forum)',                body: 'var(--font-nunito)',         displayLabel: 'Forum',                bodyLabel: 'Nunito' },
}

export const SPACING: Record<GalleryPreferences['photoSpacing'], { gap: string; padding: string }> = {
  tight:   { gap: '2px',  padding: '2px'  },
  relaxed: { gap: '12px', padding: '12px' },
  airy:    { gap: '24px', padding: '24px' },
}

export const ACCENTS: Record<GalleryPreferences['accentColor'], string> = {
  gold:   'oklch(0.78 0.09 80)',
  ivory:  'oklch(0.90 0.03 88)',
  sage:   'oklch(0.72 0.08 145)',
  rose:   'oklch(0.72 0.09 10)',
  slate:  'oklch(0.68 0.05 230)',
  custom: 'oklch(0.78 0.09 80)',
}
