import getGalleryById from '@/features/gallery/actions/getGalleryById'
import GallerySecurityLayout from '@/features/gallery/components/gallery-security-layout'

export const dynamic = 'force-dynamic'

export default async function GallerySecurityPage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params
  const gallery = await getGalleryById(galleryId)

  if (!gallery) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Gallery not found.
      </div>
    )
  }

  return <GallerySecurityLayout gallery={gallery} />
}
