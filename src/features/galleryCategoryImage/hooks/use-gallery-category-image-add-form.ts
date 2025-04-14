import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from '@/components/ui/use-toast'
import { useAction } from '@/hooks/useAction'
import { onImagesUpload } from '@/utils/functions'

import { createGalleryCategoryImage } from '../actions/createGalleryCategoryImage'
import { GalleryCategoryImageSchema } from '../actions/schema'

type UseGalleryCategoryImageAddFormProps = {
  collectionId: string
  onSuccessCallback: () => void
}

export default function useGalleryCategoryImageAddForm({
  collectionId,
  onSuccessCallback,
}: UseGalleryCategoryImageAddFormProps) {
  const formSchema = GalleryCategoryImageSchema

  type Inputs = z.infer<typeof formSchema>

  const { execute, fieldErrors } = useAction(createGalleryCategoryImage, {
    onSuccess: () => {
      toast({
        title: 'Images uploaded and saved!',
      })
      onSuccessCallback()
    },
    onError: (error) => {
      toast({
        title: error,
        variant: 'destructive',
      })
    },
  })

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: collectionId,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    const images = data.imageUrl || []

    console.log('images', images)

    // Separate existing URLs and new files
    const existingUrls = images.filter(
      (img) => typeof img === 'string'
    ) as string[]
    const newFiles = images.filter((img) => img instanceof File) as File[]

    console.log('newFiles', newFiles)

    let uploadedUrls: string[] | undefined = []

    // Upload new files if any
    if (newFiles.length > 0) {
      uploadedUrls = await onImagesUpload(newFiles)

      if (!uploadedUrls) {
        toast({
          title: 'Failed to upload images',
          variant: 'destructive',
        })
        return
      }
    }

    console.log('uploadedUrls', uploadedUrls)

    // Merge old and new URLs
    const updatedData = {
      ...data,
      imageUrl: [...existingUrls, ...uploadedUrls],
    }

    await execute(updatedData)

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
