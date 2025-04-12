'use client'

import { Gallery } from '@prisma/client'
import React from 'react'

import GalleryCategoryDetail from '@/features/gallery/components/gallery-category-detail'

type GalleryMainProps = {
  galleryData: Gallery
}

export default function GalleryDetailMain({ galleryData }: GalleryMainProps) {
  return <GalleryCategoryDetail galleryData={galleryData} />
}
