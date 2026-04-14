'use client'

import GalleryForm from './gallery-form'
import useGalleryForm from '../hooks/use-gallery-form'

type GalleryCreateFormProps = {
  onSuccess?: () => void
}

export default function GalleryCreateForm({ onSuccess }: GalleryCreateFormProps) {
  const { form, handleSubmit } = useGalleryForm({
    type: 'create',
    onSuccess,
  })

  return <GalleryForm form={form} handleSubmit={handleSubmit} />
}
