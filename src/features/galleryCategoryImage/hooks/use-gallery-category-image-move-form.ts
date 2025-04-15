import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from '@/components/ui/use-toast'
import { GalleryCategoryImageSchema } from '@/features/galleryCategoryImage/actions/schema'
import { updateGalleryCategoryImage } from '@/features/galleryCategoryImage/actions/updateGalleryCategoryImage'
import { useAction } from '@/hooks/useAction'

type UseGalleryCategoryImageAddFormProps = {
  categoryImageId: string
  onSuccessCallback: () => void
}

export default function useGalleryCategoryImageMoveForm({
  categoryImageId,
  onSuccessCallback,
}: UseGalleryCategoryImageAddFormProps) {
  const formSchema = GalleryCategoryImageSchema

  type Inputs = z.infer<typeof formSchema>
  const { execute, fieldErrors } = useAction(updateGalleryCategoryImage, {
    onSuccess: () => {
      toast({
        title: 'Images moved!',
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
      galleryCategoryImageId: categoryImageId,
      categoryId: '',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('data', data)
    console.log('test')
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
