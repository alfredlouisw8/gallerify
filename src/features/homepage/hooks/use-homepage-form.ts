import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { toast } from '@/components/ui/use-toast'
import { useAction } from '@/hooks/useAction'
import { onImagesUpload } from '@/utils/functions'

import { UpdateProfileSchema } from '../actions/schema'
import { updateProfile } from '../actions/updateProfile'
import { ProfileData } from '../types'

type ProfileFormProps = {
  profileData: ProfileData
}

export default function UseHomepageForm({ profileData }: ProfileFormProps) {
  const formSchema = UpdateProfileSchema

  const { execute, fieldErrors } = useAction(updateProfile, {
    onSuccess: () => {
      toast({
        title: 'Profile updated successfully',
      })
    },
    onError: (error) => {
      toast({
        title: error,
        variant: 'destructive',
      })
    },
  })

  type Inputs = z.infer<typeof formSchema>
  type ImageKey = 'aboutImage' | 'bannerImage' | 'logo'

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profileData.user.username,
      aboutImage: profileData.aboutImage || undefined,
      aboutText: profileData.aboutText,
      bannerImage: profileData.bannerImage || undefined,
      instagram: profileData.instagram,
      logo: profileData.logo || undefined,
      whatsapp: profileData.whatsapp,
    },
  })

  const handleSubmit = form.handleSubmit(async (data: Inputs) => {
    const updatedData = { ...data }

    for (const key of ['aboutImage', 'bannerImage', 'logo'] as ImageKey[]) {
      const value = data[key]

      // No value, skip
      if (!value) continue

      // If it's a File, upload it
      if (value instanceof File) {
        const uploadedUrls = await onImagesUpload([value])
        if (!uploadedUrls || uploadedUrls.length === 0) {
          toast({
            title: `Failed to upload ${key}`,
            variant: 'destructive',
          })
          return
        }
        updatedData[key] = uploadedUrls[0]
      } else {
        // Existing string URL, keep as-is
        updatedData[key] = value
      }
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

  return {
    form,
    handleSubmit,
  } as const
}
