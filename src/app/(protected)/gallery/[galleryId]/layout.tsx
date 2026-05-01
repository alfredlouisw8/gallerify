import {
  Bodoni_Moda, Cinzel, Cormorant_Garamond, DM_Sans, DM_Serif_Display,
  EB_Garamond, Forum, Fraunces, Inter, Italiana, Jost, Karla, Lato,
  Libre_Baskerville, Lora, Montserrat, Mulish, Nunito, Nunito_Sans,
  Open_Sans, Outfit, Playfair_Display, Raleway, Source_Sans_3,
  Spectral, Tenor_Sans,
} from 'next/font/google'
import { redirect } from 'next/navigation'
import React from 'react'

const bodoniModa     = Bodoni_Moda({ subsets: ['latin'], variable: '--font-bodoni', weight: ['400','500','600','700','900'], style: ['normal','italic'], display: 'swap', adjustFontFallback: false })
const jost           = Jost({ subsets: ['latin'], variable: '--font-jost', weight: ['300','400','500','600'], display: 'swap' })
const playfair       = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['400','500','600','700'], style: ['normal','italic'], display: 'swap' })
const inter          = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['300','400','500','600'], display: 'swap' })
const cormorant      = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-cormorant', weight: ['300','400','500','600','700'], style: ['normal','italic'], display: 'swap' })
const outfit         = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['300','400','500','600'], display: 'swap' })
const dmSerifDisplay = DM_Serif_Display({ subsets: ['latin'], variable: '--font-dm-serif', weight: ['400'], display: 'swap' })
const dmSans         = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['300','400','500','600'], display: 'swap' })
const fraunces       = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['300','400','500','600','700'], display: 'swap' })
const nunitoSans     = Nunito_Sans({ subsets: ['latin'], variable: '--font-nunito-sans', weight: ['300','400','500','600'], display: 'swap', adjustFontFallback: false })
const ebGaramond     = EB_Garamond({ subsets: ['latin'], variable: '--font-eb-garamond', weight: ['400','500','600'], style: ['normal','italic'], display: 'swap' })
const lato           = Lato({ subsets: ['latin'], variable: '--font-lato', weight: ['300','400','700'], display: 'swap' })
const cinzel         = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400','500','600'], display: 'swap' })
const raleway        = Raleway({ subsets: ['latin'], variable: '--font-raleway', weight: ['300','400','500','600'], display: 'swap' })
const lora           = Lora({ subsets: ['latin'], variable: '--font-lora', weight: ['400','500','600','700'], style: ['normal','italic'], display: 'swap' })
const montserrat     = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', weight: ['300','400','500','600'], display: 'swap' })
const spectral       = Spectral({ subsets: ['latin'], variable: '--font-spectral', weight: ['300','400','500','600'], style: ['normal','italic'], display: 'swap' })
const karla          = Karla({ subsets: ['latin'], variable: '--font-karla', weight: ['300','400','500','600'], display: 'swap' })
const libreBaskerville = Libre_Baskerville({ subsets: ['latin'], variable: '--font-libre-baskerville', weight: ['400','700'], style: ['normal','italic'], display: 'swap' })
const sourceSans     = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans', weight: ['300','400','500','600'], display: 'swap' })
const italiana       = Italiana({ subsets: ['latin'], variable: '--font-italiana', weight: ['400'], display: 'swap' })
const openSans       = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans', weight: ['300','400','500','600'], display: 'swap' })
const tenorSans      = Tenor_Sans({ subsets: ['latin'], variable: '--font-tenor-sans', weight: ['400'], display: 'swap' })
const mulish         = Mulish({ subsets: ['latin'], variable: '--font-mulish', weight: ['300','400','500','600'], display: 'swap' })
const forum          = Forum({ subsets: ['latin'], variable: '--font-forum', weight: ['400'], display: 'swap' })
const nunito         = Nunito({ subsets: ['latin'], variable: '--font-nunito', weight: ['300','400','500','600'], display: 'swap' })

const ALL_FONT_VARS = [
  bodoniModa, jost, playfair, inter, cormorant, outfit,
  dmSerifDisplay, dmSans, fraunces, nunitoSans, ebGaramond, lato,
  cinzel, raleway, lora, montserrat, spectral, karla,
  libreBaskerville, sourceSans, italiana, openSans, tenorSans, mulish, forum, nunito,
].map(f => f.variable).join(' ')

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
        <div className={`${ALL_FONT_VARS} h-full`}>{children}</div>
      </GalleryLayoutShell>
    </GalleryDesignShell>
  )
}
