'use client'

import { PlusCircleIcon } from 'lucide-react'
import React, { useState } from 'react'

import { MultiImageUpload } from '@/components/forms/multi-image-upload'
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
import useGalleryCategoryImageAddForm from '@/features/galleryCategoryImage/hooks/use-gallery-category-image-add-form'

type GalleryCategoryImageAddFormProps = {
  collectionId: string
  mutateData: () => void
}

export default function GalleryCategoryImageAddForm({
  collectionId,
  mutateData,
}: GalleryCategoryImageAddFormProps) {
  const [open, setOpen] = useState(false)

  const onSuccessCallback = () => {
    mutateData()
    setOpen(false)
  }

  const { form, handleSubmit } = useGalleryCategoryImageAddForm({
    collectionId,
    onSuccessCallback,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)} asChild>
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
              <MultiImageUpload
                name="imageUrl"
                accept="image/*"
                required
                imagePreview
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
