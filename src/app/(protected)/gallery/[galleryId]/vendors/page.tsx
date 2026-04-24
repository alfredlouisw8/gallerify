import getGalleryById from '@/features/gallery/actions/getGalleryById'
import { getGalleryVendorShares } from '@/features/gallery/actions/getGalleryVendorShares'
import { VendorSharesView } from '@/features/gallery/components/VendorSharesView'
import { getStorageUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function GalleryVendorsPage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params
  const [shares, gallery] = await Promise.all([
    getGalleryVendorShares(galleryId),
    getGalleryById(galleryId),
  ])

  const galleryCategories = gallery?.GalleryCategory ?? []

  const allImages = galleryCategories.flatMap((cat) =>
    cat.GalleryCategoryImage.map((img) => ({
      id: img.id,
      imageUrl: getStorageUrl(img.imageUrl),
    }))
  )

  const categories = galleryCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    images: cat.GalleryCategoryImage.map((img) => ({
      id: img.id,
      imageUrl: getStorageUrl(img.imageUrl),
    })),
  }))

  return (
    <div className="overflow-auto p-6 lg:p-8">
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Vendor Shares</h2>
          <p className="text-sm text-muted-foreground">
            Links shared with vendors such as florists, MUAs, venues, and planners.
          </p>
        </div>
        <VendorSharesView
          galleryId={galleryId}
          initialShares={shares}
          allImages={allImages}
          categories={categories}
        />
      </div>
    </div>
  )
}
