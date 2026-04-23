'use client'

import { Gallery, Watermark } from '@/types'

import GalleryForm from './gallery-form'
import useGalleryForm from '../hooks/use-gallery-form'

type GalleryUpdateFormProps = {
  galleryData: Gallery
  watermarks: Watermark[]
}

export default function GalleryUpdateForm({
  galleryData,
  watermarks,
}: GalleryUpdateFormProps) {
  const { form, handleSubmit } = useGalleryForm({
    type: 'update',
    galleryData,
  })

  return (
    <GalleryForm
      form={form}
      handleSubmit={handleSubmit}
      noCard
      hideBanner
      watermarks={watermarks}
    />
  )
}
