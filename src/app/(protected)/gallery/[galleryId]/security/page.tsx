import { getTranslations } from 'next-intl/server'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import GallerySecurityLayout from '@/features/gallery/components/gallery-security-layout'

export const dynamic = 'force-dynamic'

export default async function GallerySecurityPage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params
  const [gallery, t] = await Promise.all([
    getGalleryById(galleryId),
    getTranslations('GalleryPage'),
  ])

  if (!gallery) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {t('notFound')}
      </div>
    )
  }

  return <GallerySecurityLayout gallery={gallery} />
}
