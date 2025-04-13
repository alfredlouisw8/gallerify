import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from '@/components/ui/use-toast'
import { createGalleryCategoryImages } from '@/features/gallery/actions/createGalleryCategoryImage'
import { GalleryCategoryImageSchema } from '@/features/gallery/actions/schema'
import { uploadToCloudinary } from '@/utils/cloudinary'

type UseGalleryCategoryImageAddFormProps = {
  collectionId: string
}

export default function useGalleryCategoryImageAddForm({
  collectionId,
}: UseGalleryCategoryImageAddFormProps) {
  const formSchema = GalleryCategoryImageSchema

  type Inputs = z.infer<typeof formSchema>

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: collectionId,
    },
  })

  // Handle multiple image uploads
  const onImagesUpload = async (files: File[]) => {
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('images', file))

      // Call server action
      return await uploadToCloudinary(formData)
    } catch (error) {
      console.error('Cloudinary Upload Error:', error)
    }
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    let uploadedUrls
    if (data.imageUrl.length > 0 && data.imageUrl[0] instanceof File) {
      uploadedUrls = await onImagesUpload(data.imageUrl as File[])

      if (!uploadedUrls) {
        toast({
          title: 'Failed to upload images',
          variant: 'destructive',
        })
        return
      }

      await createGalleryCategoryImages({
        galleryCategoryId: collectionId,
        images: uploadedUrls.map((url: string) => ({
          url,
        })),
      })

      toast({
        title: 'Images uploaded and saved!',
      })
    }
  })

  return { form, handleSubmit }
}
