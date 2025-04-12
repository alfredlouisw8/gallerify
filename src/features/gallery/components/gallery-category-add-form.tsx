import { PlusCircleIcon } from 'lucide-react'
import React from 'react'

import { TextFormField } from '@/components/forms/text-form-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import useGalleryCategoryAddForm from '@/features/gallery/hooks/use-gallery-category-add-form'

type GalleryCategoryAddFormProps = {
  galleryId: string
  onSuccessAction: () => void
}

export default function GalleryCategoryAddForm({
  galleryId,
  onSuccessAction,
}: GalleryCategoryAddFormProps) {
  const { form, handleSubmit } = useGalleryCategoryAddForm({
    galleryId,
    onSuccessAction,
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <PlusCircleIcon className="mr-2 size-3 text-gray-400" />
          <span className="text-xs text-gray-400">Add Category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-8"
            >
              <TextFormField name="name" label="Category Name" required />

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
