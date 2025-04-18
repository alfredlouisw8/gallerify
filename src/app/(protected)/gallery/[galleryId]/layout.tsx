import { redirect } from 'next/navigation'
import React from 'react'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import GallerySidebar from '@/features/gallery/components/layout/gallery-sidebar'
import GalleryTopNavigationBar from '@/features/gallery/components/layout/gallery-top-navigationbar'
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
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <GalleryTopNavigationBar galleryData={gallery} session={session} />

      {/* Main content below nav: sidebar + children */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[250px] overflow-y-auto border-r lg:w-[330px]">
          <GallerySidebar galleryData={gallery} />
        </div>

        {/* Main children content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
