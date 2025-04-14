import { redirect } from 'next/navigation'
import React from 'react'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import GallerySidebar from '@/features/gallery/components/sidebar/gallery-sidebar'
import { auth } from '@/lib/auth/auth'

export default async function GalleryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ galleryId: string }>
}) {
  const session = await auth()

  const { galleryId } = await params
  const gallery = await getGalleryById(galleryId)

  if (!gallery) {
    redirect('/')
  }

  if (!session) {
    redirect('/')
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[250px_1fr] lg:grid-cols-[330px_1fr]">
      <GallerySidebar galleryData={gallery} />

      <div className="flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
