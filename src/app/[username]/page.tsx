import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { getProfileByUsername } from '@/features/public/actions/getProfileByUsername'
import { getPublishedGalleriesByUsername } from '@/features/public/actions/getPublishedGalleriesByUsername'
import CustomerPageView from '@/features/public/components/CustomerPageView'
import { createClient } from '@/lib/supabase-server'
import type { HomepagePreferences } from '@/types'

// Always render fresh — never serve a cached version of the portfolio page
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) {
    return { title: 'Not Found' }
  }

  return {
    title: `${username} — Photography`,
    description:
      profile.aboutText ?? `View ${username}'s photography portfolio.`,
  }
}

export default async function CustomerPage({ params, searchParams }: Props) {
  const { username } = await params
  const resolvedSearch = await searchParams

  const headersList = await headers()
  const isSubdomain = headersList.get('x-username') !== null

  const [profile, galleries] = await Promise.all([
    getProfileByUsername(username),
    getPublishedGalleriesByUsername(username),
  ])
  if (!profile) {
    notFound()
  }

  // ── Design preview bypass (owner only) ──────────────────────────────────────
  if (resolvedSearch._preview === '1') {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) notFound()

    const p = resolvedSearch
    const previewPrefs: HomepagePreferences = {
      colorTheme: (p.colorTheme as HomepagePreferences['colorTheme']) ?? profile.homepagePreferences.colorTheme,
      accentColor: (p.accentColor as HomepagePreferences['accentColor']) ?? profile.homepagePreferences.accentColor,
      fontPairing: (p.fontPairing as HomepagePreferences['fontPairing']) ?? profile.homepagePreferences.fontPairing,
      overlayIntensity: (p.overlayIntensity as HomepagePreferences['overlayIntensity']) ?? profile.homepagePreferences.overlayIntensity,
      coverPosition: (p.coverPosition as HomepagePreferences['coverPosition']) ?? profile.homepagePreferences.coverPosition,
    }

    return (
      <CustomerPageView
        profile={profile}
        galleries={galleries}
        username={username}
        galleryBasePath={isSubdomain ? '/' : `/${username}/`}
        preferences={previewPrefs}
        preview
      />
    )
  }

  // On subdomains (gerrardarya.gallerify.app) the username is in the host,
  // so gallery links should be /slug — not /username/slug.
  const galleryBasePath = isSubdomain ? '/' : `/${username}/`

  return (
    <CustomerPageView
      profile={profile}
      galleries={galleries}
      username={username}
      galleryBasePath={galleryBasePath}
    />
  )
}
