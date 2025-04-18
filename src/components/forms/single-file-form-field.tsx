'use client'

import React, {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  useEffect,
  useState,
} from 'react'
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form'

import OptionalLabel from '@/components/forms/optional-label'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn, getCloudinaryUrl } from '@/lib/utils'

export type SingleFileFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  'type' | 'name' | 'value' | 'multiple' | 'onChange' | 'onBlur'
> & {
  name: TName
  label?: string
  description?: string
  hasValueChangedFeedback?: boolean
  onChangeFieldValue?: ChangeEventHandler<HTMLInputElement>
  previewImage?: boolean
}

export function SingleFileFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  required,
  readOnly,
  disabled,
  placeholder,
  hasValueChangedFeedback,
  onChangeFieldValue,
  previewImage = false,
  className,
  ...props
}: SingleFileFormFieldProps<TFieldValues, TName>) {
  const ctx = useFormContext<TFieldValues>()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  return (
    <FormField
      name={name}
      control={ctx.control}
      render={({ field, formState, fieldState }) => {
        useEffect(() => {
          const value = field.value

          console.log('value', value)

          if (!previewImage) return

          // If value is a string (existing URL)
          if (typeof value === 'string') {
            setPreviewUrl(getCloudinaryUrl(value))
            return
          }

          // Reset if no valid value
          setPreviewUrl(null)
        }, [field.value, previewImage])

        return (
          <FormItem>
            {label && (
              <FormLabel>
                {label}
                {!required && <OptionalLabel className="ml-1" />}
              </FormLabel>
            )}

            {previewImage && previewUrl && (
              <div className="mb-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="size-24 rounded border object-cover"
                />
              </div>
            )}

            <FormControl>
              <Input
                type="file"
                disabled={formState.isSubmitting || disabled}
                {...props}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null
                  field.onChange(file)
                  onChangeFieldValue?.(event)
                }}
                className={cn(
                  hasValueChangedFeedback && fieldState.isDirty && 'bg-warning',
                  className
                )}
              />
            </FormControl>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
