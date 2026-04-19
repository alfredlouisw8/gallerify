import { notFound } from 'next/navigation'

import getGalleryById from '@/features/gallery/actions/getGalleryById'
import { getOwnerClientSelects } from '@/features/public/actions/getOwnerClientSelects'
import ClientSelectsView from '@/features/public/components/ClientSelectsView'

export default async function ClientSelectsPage({
  params,
}: {
  params: Promise<{ galleryId: string }>
}) {
  const { galleryId } = await params
  const [gallery, images] = await Promise.all([
    getGalleryById(galleryId),
    getOwnerClientSelects(galleryId),
  ])

  if (!gallery) notFound()

  return <ClientSelectsView images={images} />
}
