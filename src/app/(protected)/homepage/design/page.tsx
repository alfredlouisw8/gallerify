import { Bodoni_Moda, Cormorant_Garamond, Inter, Jost, Outfit, Playfair_Display } from 'next/font/google'
import { redirect } from 'next/navigation'

import getProfile from '@/features/homepage/actions/getProfile'
import getGalleries from '@/features/gallery/actions/getGalleries'
import { createClient } from '@/lib/supabase-server'
import { HomepageDesignShell } from '@/features/homepage/context/homepage-design-context'
import HomepageDesignPreview from './HomepageDesignPreview'

export const dynamic = 'force-dynamic'

const bodoniModa = Bodoni_Moda({ subsets: ['latin'], variable: '--font-bodoni', weight: ['400', '500', '600', '700', '900'], style: ['normal', 'italic'], display: 'swap' })
const jost = Jost({ subsets: ['latin'], variable: '--font-jost', weight: ['300', '400', '500', '600'], display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['300', '400', '500', '600'], display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-cormorant', weight: ['300', '400', '500', '600', '700'], style: ['normal', 'italic'], display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['300', '400', '500', '600'], display: 'swap' })

export default async function HomepageDesignPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [profile, galleries] = await Promise.all([
    getProfile(),
    getGalleries(),
  ])

  if (!profile || 'error' in profile) redirect('/homepage')

  const username = profile.username ?? ''

  return (
    <HomepageDesignShell initialPrefs={profile.homepagePreferences}>
      <div className={`${bodoniModa.variable} ${jost.variable} ${playfair.variable} ${inter.variable} ${cormorant.variable} ${outfit.variable} h-screen overflow-hidden`}>
        <HomepageDesignPreview profile={profile} galleries={galleries} username={username} />
      </div>
    </HomepageDesignShell>
  )
}
