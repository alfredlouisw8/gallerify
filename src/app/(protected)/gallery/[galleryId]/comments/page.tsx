import { getGalleryComments } from '@/features/gallery/actions/getGalleryComments'
import GalleryCommentsView from '@/features/gallery/components/GalleryCommentsView'

export default async function GalleryCommentsPage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params
  const comments = await getGalleryComments(galleryId)

  return (
    <div className="overflow-auto p-6 lg:p-8">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Client Feedback</h2>
          <p className="text-sm text-muted-foreground">
            Comments, feedback, and requests left by your client on individual photos.
          </p>
        </div>
        <GalleryCommentsView galleryId={galleryId} initialComments={comments} />
      </div>
    </div>
  )
}
