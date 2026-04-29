import { getTranslations } from 'next-intl/server'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import { getWatermarks } from '@/features/homepage/actions/watermarks'
import GalleryUpdateLayout from '@/features/gallery/components/gallery-update-layout'

export default async function GalleryUpdatePage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params
  const [gallery, watermarks, t] = await Promise.all([
    getGalleryById(galleryId),
    getWatermarks(),
    getTranslations('GalleryPage'),
  ])

  if (!gallery) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {t('notFound')}
      </div>
    )
  }

  return <GalleryUpdateLayout gallery={gallery} watermarks={watermarks} />
}
