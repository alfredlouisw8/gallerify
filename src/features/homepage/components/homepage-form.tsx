'use client'

import React from 'react'

import { CheckboxFormField } from '@/components/forms/checkbox-form-field'
import { MultiImageUpload } from '@/components/forms/multi-image-upload'
import { TextAreaFormField } from '@/components/forms/text-area-form-field'
import { TextFormField } from '@/components/forms/text-form-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import useGalleryForm from '@/features/gallery/hooks/use-gallery-form'

export default function HomepageForm() {
  const { form, handleSubmit } = useGalleryForm({
    type: 'create',
  })
  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-8"
      >
        <TextFormField name="title" label="Homepage URL" />
        <MultiImageUpload
          name="bannerImage"
          label="Website Image"
          accept="image/*"
          required
          imagePreview
        />
        <MultiImageUpload
          name="bannerImage"
          label="Icon / Logo"
          accept="image/*"
          imagePreview
        />
        <TextFormField name="slug" label="Whatsapp" />
        <TextFormField name="slug" label="Instagram" />
        <TextAreaFormField name="slug" label="About Me" />

        <CheckboxFormField name="isPublished" label="Published" />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Update
        </Button>
      </form>
    </Form>
  )
}
