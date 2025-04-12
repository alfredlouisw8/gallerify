'use client'

import { Gallery } from '@prisma/client'
import React, { useState } from 'react'

import { GalleryContext } from '@/app/context/gallery-context'
import getGalleryById from '@/features/gallery/actions/getGalleryById'

export default function GalleryProvider({
  children,
  galleryData,
}: {
  children: React.ReactNode
  galleryData: Gallery
}) {
  const [gallery, setGallery] = useState(galleryData)

  const refetchGallery = async () => {
    const refreshed = await getGalleryById(gallery.id)
    setGallery(refreshed)
  }

  return (
    <GalleryContext.Provider value={{ gallery, refetchGallery }}>
      {children}
    </GalleryContext.Provider>
  )
}
