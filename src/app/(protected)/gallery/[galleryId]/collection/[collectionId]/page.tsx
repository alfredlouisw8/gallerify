import React from 'react'
import { getTranslations } from 'next-intl/server'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import GalleryCategoryDetail from '@/features/galleryCategory/components/gallery-category-detail'

type CollectionPageProps = {
  params: Promise<{ collectionId: string; galleryId: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { galleryId, collectionId } = await params
  const [gallery, t] = await Promise.all([
    getGalleryById(galleryId),
    getTranslations('GalleryDetailPage'),
  ])

  if (!gallery) {
    return <div>{t('loading')}</div>
  }

  return (
    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 lg:gap-6 lg:p-6">
      <GalleryCategoryDetail
        galleryData={gallery}
        collectionId={collectionId}
      />
    </main>
  )
}
