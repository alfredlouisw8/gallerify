import React from 'react'

import GalleryCategoryDetail from '@/features/galleryCategory/components/gallery-category-detail'

type CollectionPageProps = {
  params: Promise<{ collectionId: string; galleryId: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionId } = await params

  return (
    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 lg:gap-6 lg:p-6">
      <GalleryCategoryDetail collectionId={collectionId} />
    </main>
  )
}
