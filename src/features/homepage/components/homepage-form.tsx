'use client'

import React from 'react'

import { SingleFileFormField } from '@/components/forms/single-file-form-field'
import { TextAreaFormField } from '@/components/forms/text-area-form-field'
import { TextFormField } from '@/components/forms/text-form-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import UseHomepageForm from '@/features/homepage/hooks/use-homepage-form'

import { ProfileData } from '../types'

type ProfileFormProps = {
  profileData: ProfileData
}

export default function HomepageForm({ profileData }: ProfileFormProps) {
  const { form, handleSubmit } = UseHomepageForm({ profileData })
  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-8"
      >
        <TextFormField name="username" label="Username" required />

        <SingleFileFormField
          name="logo"
          label="Logo"
          accept="image/*"
          previewImage
        />

        <SingleFileFormField
          name="bannerImage"
          label="Banner Image"
          accept="image/*"
          previewImage
        />

        <TextAreaFormField name="aboutText" label="About Text" />

        <SingleFileFormField
          name="aboutImage"
          label="About Image"
          accept="image/*"
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
