import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { mutate as globalMutate } from 'swr'
import { z } from 'zod'

import { toast } from '@/components/ui/use-toast'
import { createGalleryCategory } from '@/features/galleryCategory/actions/createGalleryCategory'
import { updateGalleryCategory } from '@/features/galleryCategory/actions/updateGalleryCategory'
import { useAction } from '@/hooks/useAction'
import { GalleryCategory } from '@/types'

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
  const router = useRouter()
  const formSchema = GalleryCategorySchema

  const actions = {
    create: {
      action: createGalleryCategory,
      successMessage: 'Category created successfully',
    },
    update: {
      action: updateGalleryCategory,
      successMessage: 'Category updated successfully',
    },
  }

  const { execute, fieldErrors } = useAction(actions[type].action, {
    onSuccess: (category) => {
      toast({
        title: actions[type].successMessage,
      })
      if (type === 'create') {
        // Refresh first so the layout re-fetches galleryData (includes the new category)
        router.refresh()
        router.push(`/gallery/${category.galleryId}/collection/${category.id}`)
      }
      if (type === 'update' && galleryCategoryData?.id) {
        // Revalidate the SWR cache so the category name in the detail header updates
        globalMutate(`category-detail-${galleryCategoryData.id}`)
        // Re-fetch server components so the sidebar category list updates
        router.refresh()
      }
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
