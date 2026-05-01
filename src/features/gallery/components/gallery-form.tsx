'use client'

import React from 'react'
import { useController } from 'react-hook-form'

import { CheckboxFormField } from '@/components/forms/checkbox-form-field'
import { DatePickerFormField } from '@/components/forms/date-picker-form-field'
import { TextFormField } from '@/components/forms/text-form-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import type { Watermark } from '@/types'
import { WatermarkPicker } from './WatermarkPicker'

import useGalleryForm from '../hooks/use-gallery-form'

type GalleryFormProps = {
  form: ReturnType<typeof useGalleryForm>['form']
  handleSubmit: ReturnType<typeof useGalleryForm>['handleSubmit']
  noCard?: boolean
  watermarks?: Watermark[]
}

export default function GalleryForm({ form, handleSubmit, noCard, watermarks }: GalleryFormProps) {
  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('slug', event.target.value.replace(/\s+/g, '-').toLowerCase())
  }

  const { field: watermarkField } = useController({
    name: 'watermarkId',
    control: form.control,
  })

  return (
    <div className={noCard ? undefined : 'mx-auto max-w-xl'}>
      <Form {...form}>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className={noCard ? 'space-y-6' : 'space-y-6 rounded-2xl border bg-card p-6'}
        >
          <TextFormField
            name="title"
            label="Gallery Name"
            onChangeFieldValue={onTitleChange}
            required
          />

          <TextFormField name="slug" label="Slug" required />

          <DatePickerFormField name="date" label="Event Date" required />

          {watermarks !== undefined && (
            <div className="space-y-2">
              <Label className="text-sm">Watermark</Label>
              <p className="text-xs text-muted-foreground">
                Select a watermark to apply to photos in this gallery.
              </p>
              <WatermarkPicker
                watermarks={watermarks}
                value={watermarkField.value}
                onChange={watermarkField.onChange}
              />
            </div>
          )}

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
