import { Gallery, Watermark } from '@/types'
import GalleryUpdateForm from './gallery-update-form'

type Props = {
  gallery: Gallery
  watermarks: Watermark[]
}

export default function GalleryUpdateLayout({ gallery, watermarks }: Props) {
  return <GalleryUpdateForm galleryData={gallery} watermarks={watermarks} />
}
