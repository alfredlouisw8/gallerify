import { zodResolver } from '@hookform/resolvers/zod'
import { GalleryCategory } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from '@/components/ui/use-toast'
import { createGalleryCategory } from '@/features/galleryCategory/actions/createGalleryCategory'
import { updateGalleryCategory } from '@/features/galleryCategory/actions/updateGalleryCategory'
import { useAction } from '@/hooks/useAction'

import { GalleryCategorySchema } from '../actions/schema'

type UseGalleryCategoryImageAddFormProps = {
  type: 'create' | 'update'
  galleryId: string
  galleryCategoryData?: GalleryCategory
  handleClose: () => void
}

export default function useGalleryCategoryAddForm({
  type,
  galleryId,
  galleryCategoryData,
  handleClose,
}: UseGalleryCategoryImageAddFormProps) {
  const formSchema = GalleryCategorySchema

  const actions = {
    create: {
      action: createGalleryCategory,
      successMessage: 'Category created successfully',
    },
    update: {
      action: updateGalleryCategory,
      successMessage: 'Category update successfully',
    },
  }

  const { execute, fieldErrors } = useAction(actions[type].action, {
    onSuccess: () => {
      toast({
        title: actions[type].successMessage,
      })
      handleClose()
    },
    onError: (error) => {
      toast({
        title: error,
        variant: 'destructive',
      })
      handleClose()
    },
  })

  type Inputs = z.infer<typeof formSchema>

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      galleryId: galleryId,
      galleryCategoryId: galleryCategoryData?.id ?? '',
      name: galleryCategoryData?.name ?? '',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await execute(data)

    if (fieldErrors) {
      for (const [key, value] of Object.entries(fieldErrors)) {
        form.setError(key as keyof typeof fieldErrors, {
          type: 'manual',
          message: value.join(','),
        })
      }
      return
    }
  })

  return { form, handleSubmit }
}
