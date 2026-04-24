'use client'

import { useController } from 'react-hook-form'
import { SaveIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePickerFormField } from '@/components/forms/date-picker-form-field'
import type { Gallery, Watermark } from '@/types'
import { WatermarkPicker } from './WatermarkPicker'
import useGalleryForm from '../hooks/use-gallery-form'

type Props = {
  galleryData: Gallery
  watermarks: Watermark[]
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="shrink-0">
        <p className="text-sm font-medium leading-none">{label}</p>
        {description && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

export default function GalleryUpdateForm({ galleryData, watermarks }: Props) {
  const { form, handleSubmit } = useGalleryForm({ type: 'update', galleryData })

  const isDirty = form.formState.isDirty
  const isSubmitting = form.formState.isSubmitting

  const { field: titleField, fieldState: titleState } = useController({ name: 'title', control: form.control })
  const { field: slugField,  fieldState: slugState  } = useController({ name: 'slug',  control: form.control })
  const { field: watermarkField } = useController({ name: 'watermarkId', control: form.control })

  return (
    <Form {...form}>
      <form onSubmit={(e) => void handleSubmit(e)} className="flex min-h-full flex-col">
        {/* Page header */}
        <div className=" p-6 lg:p-8">
          <div className="max-w-lg">
            <h2 className="text-base font-semibold">General Settings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Basic information about this gallery.
            </p>
          </div>
        </div>

        {/* Settings rows */}
        <div className="flex-1 divide-y px-6 lg:px-8">
          <div className="max-w-lg">
          {/* Gallery Name */}
          <SettingsRow
            label="Gallery Name"
            description="The name your clients will see when viewing this gallery."
          >
            <Input
              {...titleField}
              placeholder="e.g. Sarah & James Wedding"
              className={titleState.error ? 'border-destructive' : ''}
            />
            {titleState.error && (
              <p className="mt-1.5 text-xs text-destructive">{titleState.error.message}</p>
            )}
          </SettingsRow>

          {/* Slug */}
          <SettingsRow
            label="URL Slug"
            description="Used in the public gallery URL. Changing this will break existing links."
          >
            <Input
              {...slugField}
              placeholder="sarah-james-wedding"
              className={`font-mono text-sm ${slugState.error ? 'border-destructive' : ''}`}
            />
            {slugState.error && (
              <p className="mt-1.5 text-xs text-destructive">{slugState.error.message}</p>
            )}
          </SettingsRow>

          {/* Event Date */}
          <SettingsRow
            label="Event Date"
            description="The date of the photographed event."
          >
            <DatePickerFormField name="date" />
          </SettingsRow>

          {/* Watermark */}
          <SettingsRow
            label="Watermark"
            description="Applied to photos when sharing or viewing this gallery."
          >
            <WatermarkPicker
              watermarks={watermarks}
              value={watermarkField.value}
              onChange={watermarkField.onChange}
            />
          </SettingsRow>
          </div>
        </div>

        {/* Sticky save bar — only visible when dirty */}
        {isDirty && (
          <div className="sticky bottom-0 z-10 border-t bg-background/95 px-6 py-3.5 backdrop-blur-sm lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">You have unsaved changes</p>
              <Button size="sm" type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? (
                  'Saving…'
                ) : (
                  <>
                    <SaveIcon className="size-3.5" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}
