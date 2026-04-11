import { notFound } from 'next/navigation'

import GalleryPageView from '@/features/public/components/GalleryPageView'
import { getPublicGalleryBySlug } from '@/features/public/actions/getPublicGalleryBySlug'

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

  const gallery = await getPublicGalleryBySlug(username, slug)

  if (!gallery) {
    notFound()
  }

  return <GalleryPageView gallery={gallery} username={username} />
}
