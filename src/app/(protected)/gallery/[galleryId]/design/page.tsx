import { Bodoni_Moda, Cormorant_Garamond, Inter, Jost, Outfit, Playfair_Display } from 'next/font/google'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import supabaseAdmin from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'
import GalleryDesignPreview from './GalleryDesignPreview'

export const dynamic = 'force-dynamic'

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})
const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

interface Props {
  params: Promise<{ galleryId: string }>
}

export default async function GalleryDesignPage({ params }: Props) {
  const { galleryId } = await params

  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  const [gallery, metaResult] = await Promise.all([
    getGalleryById(galleryId),
    supabaseAdmin
      .from('user_metadata')
      .select('username')
      .eq('user_id', user?.id ?? '')
      .maybeSingle(),
  ])

  if (!gallery) return <div className="p-8 text-sm text-muted-foreground">Gallery not found.</div>

  const username = metaResult.data?.username ?? ''

  return (
    <div className={`${bodoniModa.variable} ${jost.variable} ${playfair.variable} ${inter.variable} ${cormorant.variable} ${outfit.variable} h-full overflow-hidden`}>
      <GalleryDesignPreview gallery={gallery} username={username} />
    </div>
  )
}
