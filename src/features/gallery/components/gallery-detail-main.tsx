'use client'

import React from 'react'

import GalleryCategoryDetail from '@/features/galleryCategory/components/gallery-category-detail'

import { GalleryWithCategory } from '../actions/getGalleryById'

type GalleryMainProps = {
  galleryData: GalleryWithCategory
}

export default function GalleryDetailMain({ galleryData }: GalleryMainProps) {
  return <GalleryCategoryDetail galleryData={galleryData} />
}
