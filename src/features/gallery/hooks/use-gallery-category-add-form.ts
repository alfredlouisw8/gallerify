import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from '@/components/ui/use-toast'
import { createGalleryCategory } from '@/features/gallery/actions/createGalleryCategory'
import { GalleryCategorySchema } from '@/features/gallery/actions/schema'

type UseGalleryCategoryImageAddFormProps = {
  galleryId: string
  onSuccessAction: () => void
}

export default function useGalleryCategoryAddForm({
  galleryId,
  onSuccessAction,
}: UseGalleryCategoryImageAddFormProps) {
  const formSchema = GalleryCategorySchema

  type Inputs = z.infer<typeof formSchema>

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      galleryId: galleryId,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log(data)
    await createGalleryCategory({
      galleryId: galleryId,
      name: data.name,
    })

    onSuccessAction()

    toast({
      title: 'New Category added!',
    })
  })

  return { form, handleSubmit }
}
