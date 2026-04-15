import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import GalleryPageView from '@/features/public/components/GalleryPageView'
import OwnerBanner from '@/features/public/components/OwnerBanner'
import { getPublicGalleryBySlug } from '@/features/public/actions/getPublicGalleryBySlug'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username, slug } = await params
  const gallery = await getPublicGalleryBySlug(username, slug)

  if (!gallery) {
    return { title: 'Not Found' }
  }

  return {
    title: `${gallery.title} — ${username}`,
    description: `View ${gallery.title} gallery by ${username}.`,
    openGraph: gallery.bannerImage?.[0]
      ? {
          images: [{ url: gallery.bannerImage[0] }],
        }
      : undefined,
  }
}

export default async function PublicGalleryPage({ params }: Props) {
  const { username, slug } = await params

  const headersList = await headers()
  const isSubdomain = headersList.get('x-username') !== null

  const gallery = await getPublicGalleryBySlug(username, slug)

  if (!gallery) {
    notFound()
  }

  let isOwnerPreview = false

  if (!gallery.isPublished) {
    // Unpublished — only the owner may view it
    const authClient = await createClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user || user.id !== gallery.userId) {
      notFound()
    }

    isOwnerPreview = true
  }

  // On subdomains the username is in the host, so '/' goes back to the portfolio.
  const profilePath = isSubdomain ? '/' : `/${username}`

  return (
    <>
      {isOwnerPreview && <OwnerBanner galleryId={gallery.id} />}
      <GalleryPageView gallery={gallery} username={username} profilePath={profilePath} />
    </>
  )
}
