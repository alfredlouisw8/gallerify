import { GalleryCategory } from '@prisma/client'
import { PencilIcon } from 'lucide-react'
import React, { useState } from 'react'

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
import useGalleryCategoryAddForm from '@/features/galleryCategory/hooks/use-gallery-category-add-form'

type GalleryCategoryUpdateFormProps = {
  galleryId: string
  galleryCategoryData: GalleryCategory
}

export default function GalleryCategoryUpdateForm({
  galleryId,
  galleryCategoryData,
}: GalleryCategoryUpdateFormProps) {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const { form, handleSubmit } = useGalleryCategoryAddForm({
    type: 'update',
    galleryId,
    galleryCategoryData,
    handleClose,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)} asChild>
        <Button variant="ghost" className="w-full justify-start py-6">
          <PencilIcon className="ml-2 mr-4 size-4 " />
          Rename
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rename Category</DialogTitle>
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
