'use client'

import { GalleryCategory } from '@prisma/client'
import { useParams } from 'next/navigation'
import React from 'react'

import { useGallery } from '@/app/context/gallery-context'
import GalleryCategoryDetail from '@/features/gallery/components/gallery-category-detail'
import GalleryCategoryImageAddForm from '@/features/gallery/components/gallery-category-image-add-form'

export default function CollectionPage() {
  const { collectionId } = useParams() // Access the collectionId param
  const { gallery, refetchGallery } = useGallery()

  const collectionIdString = Array.isArray(collectionId)
    ? collectionId[0]
    : collectionId

  const collection = gallery.GalleryCategory.find(
    (cat: GalleryCategory) => cat.id === collectionId
  )

  if (!gallery) {
    return <div>Loading...</div>
  }

  return (
    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-5">
          <h1 className="text-2xl">{collection.name}</h1>
          <GalleryCategoryImageAddForm
            collectionId={collectionIdString}
            onSuccessAction={async () => {
              await refetchGallery()
            }}
          />
        </div>
        <GalleryCategoryDetail
          galleryData={gallery}
          collectionId={collectionIdString}
        />
      </div>
    </main>
  )
}
