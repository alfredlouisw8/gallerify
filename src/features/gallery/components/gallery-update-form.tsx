'use client'

import { Gallery } from '@prisma/client'

import GalleryForm from './gallery-form'
import useGalleryForm from '../hooks/use-gallery-form'

type GalleryUpdateFormProps = {
  galleryData: Gallery
}

export default function GalleryUpdateForm({
  galleryData,
}: GalleryUpdateFormProps) {
  const { form, handleSubmit } = useGalleryForm({
    type: 'update',
    galleryData,
  })

  return <GalleryForm form={form} handleSubmit={handleSubmit} />
}
