import { getTranslations } from 'next-intl/server'

import { Gallery } from '@/types'
import GalleryClientAccessForm from './gallery-client-access-form'
import GalleryDownloadForm from './gallery-download-form'
import GalleryPrivacyForm from './gallery-privacy-form'

type Props = {
  gallery: Gallery
}

export default async function GallerySecurityLayout({ gallery }: Props) {
  const t = await getTranslations('GallerySecurity')

  return (
    <div className="overflow-auto p-6 lg:p-8">
      <div className="max-w-lg">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <div className="mb-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t('privacy')}
              </h3>
            </div>
            <GalleryPrivacyForm
              galleryId={gallery.id}
              isPasswordProtected={gallery.isPasswordProtected}
            />
          </div>

          <div className="border-t" />

          <div>
            <div className="mb-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t('clientAccess')}
              </h3>
            </div>
            <GalleryClientAccessForm
              galleryId={gallery.id}
              clientAccessEnabled={gallery.clientAccessEnabled}
              isClientPasswordProtected={gallery.isClientPasswordProtected}
              showClientSelects={gallery.showClientSelects}
            />
          </div>

          <div className="border-t" />

          <div>
            <div className="mb-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t('downloads')}
              </h3>
            </div>
            <GalleryDownloadForm
              galleryId={gallery.id}
              downloadEnabled={gallery.downloadEnabled}
              downloadPinRequired={gallery.downloadPinRequired}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
