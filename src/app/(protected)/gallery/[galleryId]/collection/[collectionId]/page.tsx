import { GalleryCategory } from '@prisma/client'
import React from 'react'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import GalleryCategoryDetail from '@/features/gallery/components/gallery-category-detail'
import GalleryCategoryImageAddForm from '@/features/gallery/components/gallery-category-image-add-form'

type CollectionPageProps = {
  params: Promise<{ collectionId: string; galleryId: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionId, galleryId } = await params

  const gallery = await getGalleryById(galleryId)

  if (!gallery) {
    return <div>Loading...</div>
  }

  const collection = gallery.GalleryCategory.find(
    (cat: GalleryCategory) => cat.id === collectionId
  )

  return (
    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-5">
          <h1 className="text-2xl">{collection?.name}</h1>
          <GalleryCategoryImageAddForm collectionId={collectionId} />
        </div>
        <GalleryCategoryDetail
          galleryData={gallery}
          collectionId={collectionId}
        />
      </div>
    </main>
  )
}
