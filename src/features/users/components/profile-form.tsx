'use client'

import { UserMetadata } from '@prisma/client'
import React from 'react'

import { SingleFileFormField } from '@/components/forms/single-file-form-field'
import { TextAreaFormField } from '@/components/forms/text-area-form-field'
import { TextFormField } from '@/components/forms/text-form-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import useProfileForm from '../hooks/use-profile-form'

type ProfileFormProps = {
  profileData: UserMetadata
}

export default function ProfileForm({ profileData }: ProfileFormProps) {
  const { form, handleSubmit } = useProfileForm({ profileData })

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-8"
      >
        <TextFormField name="username" label="Username" required />

        <SingleFileFormField name="logo" label="Logo" previewImage />

        <SingleFileFormField
          name="bannerImage"
          label="Banner Image"
          previewImage
        />

        <TextAreaFormField name="aboutText" label="About Text" />

        <SingleFileFormField
          name="aboutImage"
          label="About Image"
          previewImage
        />

        <TextFormField name="whatsapp" label="Whatsapp" />

        <TextFormField name="instagram" label="Instagram" />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  )
}
