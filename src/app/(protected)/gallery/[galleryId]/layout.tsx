import { redirect } from 'next/navigation'
import React from 'react'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import GallerySidebar from '@/features/gallery/components/layout/gallery-sidebar'
import GalleryTopNavigationBar from '@/features/gallery/components/layout/gallery-top-navigationbar'
import { createClient } from '@/lib/supabase-server'

export default async function GalleryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ galleryId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { galleryId } = await params
  const gallery = await getGalleryById(galleryId)

  if (!gallery || !user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <GalleryTopNavigationBar galleryData={gallery} />

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
