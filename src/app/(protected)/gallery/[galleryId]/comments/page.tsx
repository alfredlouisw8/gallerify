import { getTranslations } from 'next-intl/server'

import { getGalleryComments } from '@/features/gallery/actions/getGalleryComments'
import GalleryCommentsView from '@/features/gallery/components/GalleryCommentsView'

export const dynamic = 'force-dynamic'

export default async function GalleryCommentsPage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params

  let comments: Awaited<ReturnType<typeof getGalleryComments>> = []
  try {
    comments = await getGalleryComments(galleryId)
  } catch {
    // Table may not exist yet (migration pending) — show empty state
  }

  const t = await getTranslations('CommentsPage')

  return (
    <div className="overflow-auto p-6 lg:p-8">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <GalleryCommentsView galleryId={galleryId} initialComments={comments} />
      </div>
    </div>
  )
}
