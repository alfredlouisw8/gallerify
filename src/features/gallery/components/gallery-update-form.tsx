'use client'

import { useController } from 'react-hook-form'
import { SaveIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('GalleryUpdateForm')
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
            <h2 className="text-base font-semibold">{t('sectionTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('sectionDesc')}
            </p>
          </div>
        </div>

        {/* Settings rows */}
        <div className="flex-1 divide-y px-6 lg:px-8">
          <div className="max-w-lg">
          {/* Gallery Name */}
          <SettingsRow
            label={t('nameLabel')}
            description={t('nameDesc')}
          >
            <Input
              {...titleField}
              placeholder={t('namePlaceholder')}
              className={titleState.error ? 'border-destructive' : ''}
            />
            {titleState.error && (
              <p className="mt-1.5 text-xs text-destructive">{titleState.error.message}</p>
            )}
          </SettingsRow>

          {/* Slug */}
          <SettingsRow
            label={t('slugLabel')}
            description={t('slugDesc')}
          >
            <Input
              {...slugField}
              placeholder={t('slugPlaceholder')}
              className={`font-mono text-sm ${slugState.error ? 'border-destructive' : ''}`}
            />
            {slugState.error && (
              <p className="mt-1.5 text-xs text-destructive">{slugState.error.message}</p>
            )}
          </SettingsRow>

          {/* Event Date */}
          <SettingsRow
            label={t('dateLabel')}
            description={t('dateDesc')}
          >
            <DatePickerFormField name="date" />
          </SettingsRow>

          {/* Watermark */}
          <SettingsRow
            label={t('watermarkLabel')}
            description={t('watermarkDesc')}
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
              <p className="text-xs text-muted-foreground">{t('unsavedChanges')}</p>
              <Button size="sm" type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? (
                  t('saving')
                ) : (
                  <>
                    <SaveIcon className="size-3.5" />
                    {t('saveChanges')}
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
