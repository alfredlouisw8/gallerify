import getGalleryById from '@/features/gallery/actions/getGalleryById'
import { getWatermarks } from '@/features/homepage/actions/watermarks'
import GalleryUpdateLayout from '@/features/gallery/components/gallery-update-layout'

export default async function GalleryUpdatePage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params
  const [gallery, watermarks] = await Promise.all([
    getGalleryById(galleryId),
    getWatermarks(),
  ])

  if (!gallery) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Gallery not found.
      </div>
    )
  }

  return <GalleryUpdateLayout gallery={gallery} watermarks={watermarks} />
}
