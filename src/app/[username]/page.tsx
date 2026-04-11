import { notFound } from 'next/navigation'

import CustomerPageView from '@/features/public/components/CustomerPageView'
import { getProfileByUsername } from '@/features/public/actions/getProfileByUsername'
import { getPublishedGalleriesByUsername } from '@/features/public/actions/getPublishedGalleriesByUsername'

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
    description: profile.aboutText ?? `View ${username}'s photography portfolio.`,
  }
}

export default async function CustomerPage({ params }: Props) {
  const { username } = await params

  const [profile, galleries] = await Promise.all([
    getProfileByUsername(username),
    getPublishedGalleriesByUsername(username),
  ])
  if (!profile) {
    notFound()
  }

  return (
    <CustomerPageView
      profile={profile}
      galleries={galleries}
      username={username}
    />
  )
}
