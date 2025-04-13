import { XIcon } from 'lucide-react'
import Image from 'next/image'
import {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  useCallback,
  useState,
} from 'react'
import { FileWithPath, useDropzone } from 'react-dropzone'
import {
  FieldPath,
  FieldValues,
  PathValue,
  useFormContext,
} from 'react-hook-form'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import RequiredLabel from './required-label'
import { Button } from '../ui/button'

export type MultiImageUploadProps<
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
  imagePreview?: boolean
}

type FileOrUrl = FileWithPath | string

export function MultiImageUpload<
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
  className,
  imagePreview = false,
  ...props
}: MultiImageUploadProps<TFieldValues, TName>) {
  const ctx = useFormContext<TFieldValues>()
  const [files, setFiles] = useState<FileOrUrl[]>(() => {
    const current = ctx.getValues(name)
    return Array.isArray(current) ? current : []
  })

  // Sync local files with RHF
  const updateFormValue = (updatedFiles: FileOrUrl[]) => {
    setFiles(updatedFiles)
    ctx.setValue(name, updatedFiles as PathValue<TFieldValues, TName>, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const updated = [...files, ...acceptedFiles]
      updateFormValue(updated)
    },
    [files, updateFormValue]
  )

  const onFileDialogCancel = useCallback(() => {
    // Do nothing for now
  }, [])

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    updateFormValue(updated)
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onFileDialogCancel,
    multiple: true,
  })

  return (
    <FormField
      name={name}
      control={ctx.control}
      render={() => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <RequiredLabel className="ml-1" />}
            </FormLabel>
          )}
          <FormControl>
            <div>
              <div
                {...getRootProps()}
                className="flex h-20 items-center justify-center border-2 border-dotted hover:cursor-pointer"
              >
                <input {...getInputProps()} accept={props.accept} />
                <div className="text-xs">Drag and drop or select files</div>
              </div>

              {imagePreview && files.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {files.map((file, i) => {
                    const imageUrl =
                      typeof file === 'string'
                        ? JSON.parse(file).url
                        : URL.createObjectURL(file)

                    return (
                      <div key={i} className="group relative">
                        <Image
                          src={imageUrl}
                          alt={
                            typeof file === 'string'
                              ? `uploaded-${i}`
                              : file.name
                          }
                          width={200}
                          height={200}
                          className="h-24 w-full rounded-md object-cover"
                        />
                        <Button
                          type="button"
                          onClick={() => removeFile(i)}
                          size="icon"
                          className="absolute right-1 top-1 size-5 rounded px-1 text-xs opacity-80 hover:opacity-100"
                        >
                          <XIcon size={4} />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
