import { redirect } from 'next/navigation'
import React from 'react'

import { GalleryDesignShell } from '@/features/gallery/context/gallery-design-context'
import getGalleryById from '@/features/gallery/actions/getGalleryById'
import { GalleryLayoutShell } from '@/features/gallery/components/layout/gallery-layout-shell'
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
      <GalleryLayoutShell galleryData={gallery} username={username}>
        {children}
      </GalleryLayoutShell>
    </GalleryDesignShell>
  )
}
