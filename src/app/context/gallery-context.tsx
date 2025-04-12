'use client'

import { Gallery } from '@prisma/client'
import { createContext, useContext } from 'react'

type GalleryContextType = {
  gallery: Gallery | null
  refetchGallery: () => Promise<void>
}
export const GalleryContext = createContext<GalleryContextType | null>(null)
export function useGallery() {
  const context = useContext(GalleryContext)
  if (!context) {
    throw new Error('useGallery must be used within a GalleryContext.Provider')
  }
  return context
}
