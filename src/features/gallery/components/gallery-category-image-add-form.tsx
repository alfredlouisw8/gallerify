import { PlusCircleIcon } from 'lucide-react'
import React from 'react'

import { MultipleFileDropzoneFormField } from '@/components/forms/mutilple-file-dropzone-form-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import useGalleryCategoryImageAddForm from '@/features/gallery/hooks/use-gallery-category-image-add-form'

type GalleryCategoryImageAddFormProps = {
  collectionId: string
  onSuccessAction: () => void
}

export default function GalleryCategoryImageAddForm({
  collectionId,
  onSuccessAction,
}: GalleryCategoryImageAddFormProps) {
  const { form, handleSubmit } = useGalleryCategoryImageAddForm({
    collectionId,
    onSuccessAction,
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <PlusCircleIcon className="mr-2 size-3" />
          Add Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>add your amazing image</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-8"
            >
              <MultipleFileDropzoneFormField
                name="imageUrl"
                accept="image/*"
                required
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                Submit
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
