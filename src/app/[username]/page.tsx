import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { getProfileByUsername } from '@/features/public/actions/getProfileByUsername'
import { getPublishedGalleriesByUsername } from '@/features/public/actions/getPublishedGalleriesByUsername'
import CustomerPageView from '@/features/public/components/CustomerPageView'

// Always render fresh — never serve a cached version of the portfolio page
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ username: string }>
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

export default async function CustomerPage({ params }: Props) {
  const { username } = await params

  const headersList = await headers()
  const isSubdomain = headersList.get('x-username') !== null

  const [profile, galleries] = await Promise.all([
    getProfileByUsername(username),
    getPublishedGalleriesByUsername(username),
  ])
  if (!profile) {
    notFound()
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
