'use client'

import { ImageIcon, UploadIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import React, {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useDropzone } from 'react-dropzone'
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
import { cn, getStorageUrl } from '@/lib/utils'

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
  previewObjectFit?: 'cover' | 'contain'
  previewAspect?: string
  previewHeight?: number
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
  hasValueChangedFeedback,
  previewImage = false,
  previewObjectFit = 'cover',
  previewAspect,
  previewHeight,
  accept,
  className,
}: SingleFileFormFieldProps<TFieldValues, TName>) {
  const ctx = useFormContext<TFieldValues>()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const blobRef = useRef<string | null>(null)

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current)
    }
  }, [])

  return (
    <FormField
      name={name}
      control={ctx.control}
      render={({ field, formState, fieldState }) => {
        // Sync preview URL with field value
        useEffect(() => {
          if (!previewImage) return
          const value = field.value
          if (!value) { setPreviewUrl(null); return }

          if (typeof value === 'string') {
            if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null }
            setPreviewUrl(getStorageUrl(value))
            return
          }

          if ((value as unknown) instanceof Blob) {
            if (blobRef.current) URL.revokeObjectURL(blobRef.current)
            const url = URL.createObjectURL(value)
            blobRef.current = url
            setPreviewUrl(url)
            return
          }

          setPreviewUrl(null)
        }, [field.value])

        const onDrop = useCallback(
          (acceptedFiles: File[]) => {
            const file = acceptedFiles[0]
            if (!file) return
            field.onChange(file)
          },
          [field.onChange]
        )

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          multiple: false,
          disabled: formState.isSubmitting || disabled,
          accept: accept
            ? Object.fromEntries(
                accept.split(',').map((t) => [t.trim(), []])
              )
            : undefined,
        })

        const hasValue = Boolean(field.value)

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation()
          field.onChange(null)
          setPreviewUrl(null)
          if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null }
        }

        return (
          <FormItem>
            {label && (
              <FormLabel>
                {label}
                {!required && <OptionalLabel className="ml-1" />}
              </FormLabel>
            )}

            <FormControl>
              <div
                {...getRootProps()}
                className={cn(
                  'relative rounded-xl border-2 border-dashed transition-colors',
                  isDragActive
                    ? 'border-primary/60 bg-primary/5'
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30',
                  (formState.isSubmitting || disabled) && 'cursor-not-allowed opacity-50',
                  !hasValue && 'cursor-pointer',
                  hasValueChangedFeedback && fieldState.isDirty && 'border-amber-400',
                  className
                )}
              >
                <input {...getInputProps()} />

                {previewImage && previewUrl ? (
                  /* Image preview state */
                  <div className="relative">
                    <div
                      className="relative overflow-hidden rounded-[10px]"
                      style={{
                        aspectRatio: previewAspect ?? undefined,
                        height: previewHeight ?? (previewAspect ? undefined : '9rem'),
                        width: previewHeight && !previewAspect ? '100%' : undefined,
                        backgroundColor: previewObjectFit === 'contain' ? 'hsl(var(--muted))' : undefined,
                      }}
                    >
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className={previewObjectFit === 'contain' ? 'object-contain p-2' : 'object-cover'}
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity hover:opacity-100" />
                    </div>
                    {/* Clear button */}
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                    >
                      <XIcon className="size-3" />
                    </button>
                    {/* Change hint */}
                    <p className="mt-1.5 px-1 text-xs text-muted-foreground">
                      Click or drag to replace
                    </p>
                  </div>
                ) : (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                      {previewImage ? (
                        <ImageIcon className="size-4 text-muted-foreground" />
                      ) : (
                        <UploadIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {isDragActive ? 'Drop to upload' : 'Click to upload'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        or drag and drop
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </FormControl>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
