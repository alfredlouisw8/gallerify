'use client'

import { PlusCircleIcon } from 'lucide-react'
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

type GalleryCategoryAddFormProps = {
  galleryId: string
}

export default function GalleryCategoryAddForm({
  galleryId,
}: GalleryCategoryAddFormProps) {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const { form, handleSubmit } = useGalleryCategoryAddForm({
    galleryId,
    handleClose,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)} asChild>
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
