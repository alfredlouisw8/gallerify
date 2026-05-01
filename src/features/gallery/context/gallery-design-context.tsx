'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

import { type GalleryPreferences, DEFAULT_GALLERY_PREFERENCES } from '@/types'

export type DesignPanel = 'cover' | 'style' | 'layout' | 'collection-header'

type GalleryDesignContextValue = {
  prefs: GalleryPreferences
  setPrefs: (prefs: GalleryPreferences) => void
  isDirty: boolean
  setIsDirty: (v: boolean) => void
  selectedPanel: DesignPanel | null
  setSelectedPanel: (panel: DesignPanel | null) => void
}

const GalleryDesignContext = createContext<GalleryDesignContextValue>({
  prefs: DEFAULT_GALLERY_PREFERENCES,
  setPrefs: () => {},
  isDirty: false,
  setIsDirty: () => {},
  selectedPanel: null,
  setSelectedPanel: () => {},
})

export function useGalleryDesign() {
  return useContext(GalleryDesignContext)
}

export function GalleryDesignShell({
  initialPrefs,
  children,
}: {
  initialPrefs: GalleryPreferences
  children: ReactNode
}) {
  const [prefs, setPrefsState] = useState<GalleryPreferences>(initialPrefs)
  const [isDirty, setIsDirty] = useState(false)
  const [selectedPanel, setSelectedPanel] = useState<DesignPanel | null>(null)

  const setPrefs = (next: GalleryPreferences) => {
    setPrefsState(next)
    setIsDirty(true)
  }

  return (
    <GalleryDesignContext.Provider
      value={{ prefs, setPrefs, isDirty, setIsDirty, selectedPanel, setSelectedPanel }}
    >
      {children}
    </GalleryDesignContext.Provider>
  )
}
