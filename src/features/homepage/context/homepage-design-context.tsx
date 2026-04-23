'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

import { type HomepagePreferences, DEFAULT_HOMEPAGE_PREFERENCES } from '@/types'

export type HomepageDesignPanel = 'color' | 'style' | 'content'

type HomepageDesignContextValue = {
  prefs: HomepagePreferences
  setPrefs: (prefs: HomepagePreferences) => void
  isDirty: boolean
  setIsDirty: (v: boolean) => void
  selectedPanel: HomepageDesignPanel | null
  setSelectedPanel: (panel: HomepageDesignPanel | null) => void
}

const HomepageDesignContext = createContext<HomepageDesignContextValue>({
  prefs: DEFAULT_HOMEPAGE_PREFERENCES,
  setPrefs: () => {},
  isDirty: false,
  setIsDirty: () => {},
  selectedPanel: null,
  setSelectedPanel: () => {},
})

export function useHomepageDesign() {
  return useContext(HomepageDesignContext)
}

export function HomepageDesignShell({
  initialPrefs,
  children,
}: {
  initialPrefs: HomepagePreferences
  children: ReactNode
}) {
  const [prefs, setPrefsState] = useState<HomepagePreferences>(initialPrefs)
  const [isDirty, setIsDirty] = useState(false)
  const [selectedPanel, setSelectedPanel] = useState<HomepageDesignPanel | null>(null)

  const setPrefs = (next: HomepagePreferences) => {
    setPrefsState(next)
    setIsDirty(true)
  }

  return (
    <HomepageDesignContext.Provider
      value={{ prefs, setPrefs, isDirty, setIsDirty, selectedPanel, setSelectedPanel }}
    >
      {children}
    </HomepageDesignContext.Provider>
  )
}
