'use client'

import React from 'react'

import { CheckboxFormField } from '@/components/forms/checkbox-form-field'
import { DatePickerFormField } from '@/components/forms/date-picker-form-field'
import { MultiImageUpload } from '@/components/forms/multi-image-upload'
import { TextFormField } from '@/components/forms/text-form-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import useGalleryForm from '../hooks/use-gallery-form'

type GalleryFormProps = {
  form: ReturnType<typeof useGalleryForm>['form']
  handleSubmit: ReturnType<typeof useGalleryForm>['handleSubmit']
}

export default function GalleryForm({ form, handleSubmit }: GalleryFormProps) {
  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('slug', event.target.value.replace(/\s+/g, '-').toLowerCase())
  }

  return (
    <div className="mx-auto max-w-xl">
      <Form {...form}>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-6 rounded-2xl border bg-card p-6"
        >
          <TextFormField
            name="title"
            label="Gallery Name"
            onChangeFieldValue={onTitleChange}
            required
          />

          <TextFormField name="slug" label="Slug" required />

          <DatePickerFormField name="date" label="Event Date" required />

          <MultiImageUpload
            name="bannerImage"
            label="Banner Image"
            accept="image/*"
            required
            imagePreview
          />

          <CheckboxFormField name="isPublished" label="Published" />

          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving…' : 'Save gallery'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
