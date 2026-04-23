import { Gallery, Watermark } from '@/types'
import GalleryUpdateForm from './gallery-update-form'

type Props = {
  gallery: Gallery
  watermarks: Watermark[]
}

export default function GalleryUpdateLayout({ gallery, watermarks }: Props) {
  return (
    <div className="overflow-auto p-6 lg:p-8">
      <div className="max-w-lg">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">General</h2>
          <p className="text-sm text-muted-foreground">
            Basic information about this gallery.
          </p>
        </div>
        <GalleryUpdateForm galleryData={gallery} watermarks={watermarks} />
      </div>
    </div>
  )
}
