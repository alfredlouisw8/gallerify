'use client'

import React from 'react'

import GalleryCategoryDetail from '@/features/galleryCategory/components/gallery-category-detail'

import { GalleryWithCategory } from '@/types'

type GalleryMainProps = {
  galleryData: GalleryWithCategory
}

export default function GalleryDetailMain({ galleryData }: GalleryMainProps) {
  const firstCategoryId = galleryData.GalleryCategory[0]?.id ?? ''
  return (
    <GalleryCategoryDetail
      galleryData={galleryData}
      collectionId={firstCategoryId}
    />
  )
}
