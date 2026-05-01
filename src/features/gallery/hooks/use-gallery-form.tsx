import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from '@/components/ui/use-toast'
import { createGallery } from '@/features/gallery/actions/createGallery'
import { GallerySchema } from '@/features/gallery/actions/schema'
import { useAction } from '@/hooks/useAction'
import { Gallery } from '@/types'
import { onImagesUpload } from '@/utils/functions'

import { updateGallery } from '../actions/updateGallery'

type GalleryFormProps = {
  type: 'create' | 'update'
  galleryData?: Gallery
  onSuccess?: () => void
}

export default function useGalleryForm({
  type,
  galleryData,
  onSuccess,
}: GalleryFormProps) {
  const router = useRouter()
  const formSchema = GallerySchema

  const actions = {
    create: {
      action: createGallery,
      successMessage: 'Gallery created successfully',
    },
    update: {
      action: updateGallery,
      successMessage: 'Gallery update successfully',
    },
  }

  const { execute, fieldErrors } = useAction(actions[type].action, {
    onSuccess: () => {
      toast({
        title: actions[type].successMessage,
      })
      onSuccess?.()
      if (type === 'create') {
        router.replace('/gallery')
      }
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
      bannerImage: galleryData?.bannerImage || [],
      title: galleryData?.title || '',
      date: galleryData?.date
        ? format(new Date(galleryData?.date || ''), 'yyyy/MM/dd')
        : '',
      isPublished: galleryData?.isPublished || false,
      slug: galleryData?.slug || '',
      galleryId: galleryData?.id || '',
      watermarkId: galleryData?.watermarkId ?? null,
    },
  })

  const handleSubmit = form.handleSubmit(async (data: Inputs) => {
    const images = data.bannerImage ?? []
    const existingUrls = images.filter((img) => typeof img === 'string') as string[]
    const newFiles = images.filter((img) => img instanceof File) as File[]

    let uploadedUrls: string[] = []
    if (newFiles.length > 0) {
      try {
        uploadedUrls = await onImagesUpload(newFiles)
      } catch (err) {
        toast({
          title: err instanceof Error ? err.message : 'Failed to upload images',
          variant: 'destructive',
        })
        return
      }
    }

    await execute({ ...data, bannerImage: [...existingUrls, ...uploadedUrls] })

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

  return {
    form,
    handleSubmit,
  } as const
}
