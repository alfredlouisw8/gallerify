import { getGalleryVendorShares } from '@/features/gallery/actions/getGalleryVendorShares'
import { VendorSharesView } from '@/features/gallery/components/VendorSharesView'

export const dynamic = 'force-dynamic'

export default async function GalleryVendorsPage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params
  const shares = await getGalleryVendorShares(galleryId)

  return (
    <div className="overflow-auto p-6 lg:p-8">
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Vendor Shares</h2>
          <p className="text-sm text-muted-foreground">
            Links shared with vendors such as florists, MUAs, venues, and planners.
          </p>
        </div>
        <VendorSharesView galleryId={galleryId} initialShares={shares} />
      </div>
    </div>
  )
}
