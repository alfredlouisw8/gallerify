import { redirect } from 'next/navigation'
import React from 'react'

import { GalleryDesignShell } from '@/features/gallery/context/gallery-design-context'
import getGalleryById from '@/features/gallery/actions/getGalleryById'
import GallerySidebar from '@/features/gallery/components/layout/gallery-sidebar'
import GalleryTopNavigationBar from '@/features/gallery/components/layout/gallery-top-navigationbar'
import supabaseAdmin from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'

export default async function GalleryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ galleryId: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { galleryId } = await params
  const gallery = await getGalleryById(galleryId)

  if (!gallery || !user) {
    redirect('/')
  }

  const { data: meta } = await supabaseAdmin
    .from('user_metadata')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle()

  const username = meta?.username ?? ''

  return (
    <GalleryDesignShell initialPrefs={gallery.preferences}>
      <div className="flex h-screen flex-col">
        <GalleryTopNavigationBar galleryData={gallery} username={username} />

        <div className="flex flex-1 overflow-hidden">
          <div className="w-[250px] overflow-y-auto border-r lg:w-[330px]">
            <GallerySidebar galleryData={gallery} />
          </div>

          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </GalleryDesignShell>
  )
}
