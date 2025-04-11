import React from 'react'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import GalleryDetailMain from '@/features/gallery/components/gallery-detail-main'

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params
  const gallery = await getGalleryById(galleryId)
  return <GalleryDetailMain galleryData={gallery} />
}
