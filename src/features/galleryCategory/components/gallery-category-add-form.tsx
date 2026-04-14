'use client'

import { PlusIcon } from 'lucide-react'
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
    type: 'create',
    galleryId,
    handleClose,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 rounded-md">
          <PlusIcon className="size-3.5" />
          <span className="sr-only">Add category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="space-y-4 pt-2"
          >
            <TextFormField name="name" label="Category name" required />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Creating…' : 'Create category'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
