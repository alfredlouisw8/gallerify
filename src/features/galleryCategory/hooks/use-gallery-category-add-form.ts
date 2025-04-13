import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from '@/components/ui/use-toast'
import { createGalleryCategory } from '@/features/galleryCategory/actions/createGalleryCategory'
import { useAction } from '@/hooks/useAction'

import { GalleryCategorySchema } from '../actions/schema'

type UseGalleryCategoryImageAddFormProps = {
  galleryId: string
  handleClose: () => void
}

export default function useGalleryCategoryAddForm({
  galleryId,
  handleClose,
}: UseGalleryCategoryImageAddFormProps) {
  const formSchema = GalleryCategorySchema

  const { execute, fieldErrors } = useAction(createGalleryCategory, {
    onSuccess: () => {
      toast({
        title: 'New Category added!',
      })
      handleClose()
    },
    onError: (error) => {
      toast({
        title: error,
        variant: 'destructive',
      })
    },
  })

  type Inputs = z.infer<typeof formSchema>

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      galleryId: galleryId,
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
